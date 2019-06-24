// simple POST request that returns the backtest result

const _ = require('lodash');
const promisify = require('tiny-promisify');
const pipelineRunner = promisify(require('../../core/workers/pipeline/parent'));

// starts a backtest
// requires a post body like:
//
// {
//   gekkoConfig: {watch: {exchange: "poloniex", currency: "USDT", asset: "BTC"},…},…}
//   data: {
//     candleProps: ["close", "start"],
//     indicatorResults: true,
//     report: true,
//     roundtrips: true
//   }
// }

const hashCode = function(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
};

module.exports = function *() {
  var mode = 'backtest';

  var config = {};

  var base = require('./baseConfig');

  var req = this.request.body;

  _.merge(config, base, req);

  config.request = {
    hash: hashCode(JSON.stringify(req)),
    body: req
  }

  this.body = yield pipelineRunner(mode, config);
}
