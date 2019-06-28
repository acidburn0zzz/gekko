const _ = require('lodash');

const moment = require('moment');
const util = require('../../core/util.js');

const handle = require('./handle');
const mongoUtil = require('./util');

const BacktestAdapterExporter = function () {
  this.db = handle;
  this.backtestResultCollection = this.db.collection(mongoUtil.settings.backtestResultCollection);
  this.exchange = mongoUtil.settings.exchange;
  this.pair = mongoUtil.settings.pair.join('_');
  _.bindAll(this);
};

BacktestAdapterExporter.prototype.processBacktestResult = function (backtest) {

  const id = backtest.id;
  delete backtest.id;
  this.backtestResultCollection.insert({
    _id: id,
    exchange: this.exchange,
    pair: this.pair,
    time: moment().unix(),
    ...backtest
  }, {ordered: false}, e => {
    if (e) {
      console.error('Fail while trying to save backtest result', e);
    }
  });
};

module.exports = BacktestAdapterExporter;
