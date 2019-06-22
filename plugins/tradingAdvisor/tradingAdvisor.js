let util = require('../../core/util');
let _ = require('lodash');
let fs = require('fs');

let config = util.getConfig();
let dirs = util.dirs();
let log = require(dirs.core + 'log');
let CandleBatcher = require(dirs.core + 'candleBatcher');

let isLeecher = config.market && config.market.type === 'leech';

let Actor = function (done) {
  _.bindAll(this);

  this.done = done;

  this.batcher = new CandleBatcher(config.tradingAdvisor.candleSize);

  this.sandbox = config.sandbox;

  // Regularize Strategy Name
  this.strategyName = config.tradingAdvisor.method;

  this.setupStrategy();

  let mode = util.gekkoMode();

  if (mode === 'realtime' && this.sandbox) {
    util.die('Gekko can\'t run in realtime mode with a sandbox strategy "'
      + this.strategyName + '"');
  }

  // the stitcher will try to pump in historical data
  // so that the strat can use this data as a "warmup period"
  //
  // the realtime "leech" market won't use the stitcher
  if (mode === 'realtime' && !isLeecher) {
    let Stitcher = require(dirs.tools + 'dataStitcher');
    let stitcher = new Stitcher(this.batcher);
    stitcher.prepareHistoricalData(done);
  } else {
    done();
  }
};

Actor.prototype.setupStrategy = function () {

  let module = `${dirs.methods}${this.strategyName}/${this.strategyName}`;

  // Running through a sandbox strategy
  if (this.sandbox) {
    module = this.sandbox.module;
  }

  if (!fs.existsSync(module + '.js')) {
    util.die('Gekko can\'t find the strategy "' + this.strategyName + '"');
  }

  log.info('\t', 'Using the strategy: ' + this.strategyName);

  const strategy = require(module);

  // bind all trading strategy specific functions
  // to the WrappedStrategy.
  const WrappedStrategy = require('./baseTradingMethod');

  _.each(strategy, function (fn, name) {
    WrappedStrategy.prototype[name] = fn;
  });

  let stratSettings;
  if (config[this.strategyName]) {
    stratSettings = config[this.strategyName];
  } else {
    stratSettings = this.sandbox.settings;
  }

  this.strategy = new WrappedStrategy(stratSettings);
  this.strategy
  .on(
    'stratWarmupCompleted',
    e => this.deferredEmit('stratWarmupCompleted', e)
  )
  .on('advice', this.relayAdvice)
  .on(
    'stratUpdate',
    e => this.deferredEmit('stratUpdate', e)
  ).on('stratNotification',
    e => this.deferredEmit('stratNotification', e)
  );

  this.strategy
  .on('tradeCompleted', this.processTradeCompleted);

  this.batcher
  .on('candle', _candle => {
    const {id, ...candle} = _candle;
    this.deferredEmit('stratCandle', candle);
    this.emitStratCandle(candle);
  });
};

// HANDLERS
// process the 1m candles
Actor.prototype.processCandle = function (candle, done) {
  this.candle = candle;
  const completedBatch = this.batcher.write([candle]);
  if (completedBatch) {
    this.next = done;
  } else {
    done();
    this.next = false;
  }
  this.batcher.flush();
};

// propogate a custom sized candle to the trading strategy
Actor.prototype.emitStratCandle = function (candle) {
  const next = this.next || _.noop;
  this.strategy.tick(candle, next);
};

Actor.prototype.processTradeCompleted = function (trade) {
  this.strategy.processTrade(trade);
};

// pass through shutdown handler
Actor.prototype.finish = function (done) {
  this.strategy.finish(done);
};

// EMITTERS
Actor.prototype.relayAdvice = function (advice) {
  advice.date = this.candle.start.clone().add(1, 'minute');
  this.deferredEmit('advice', advice);
};

module.exports = Actor;
