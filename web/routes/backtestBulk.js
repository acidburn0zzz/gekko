const _ = require('lodash');
const promisify = require('tiny-promisify');
const pipelineRunner = promisify(require('../../core/workers/pipeline/parent'));

const util = require('../../core/util');
const dirs = util.dirs();

const combinatorics = require(dirs.plugins + '/combinatorics');

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

const hashCode = function (s) {
  return s.split("").reduce(function (a, b) {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a
  }, 0);
};

module.exports = function* () {
  let mode = 'backtest';
  let base = require('./baseConfig');

  let req = this.request.body;

  let combinations = combinatorics.map(req);

  combinations.forEach(c => {
    let config = {};
    _.merge(config, base, c);

    config.request = {
      hash: hashCode(JSON.stringify(req)),
      body: req
    };

    pipelineRunner(mode, config);
  });

  this.body = {
    parentId: req.parentId
  };
}
