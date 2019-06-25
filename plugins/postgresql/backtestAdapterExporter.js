const _ = require('lodash');

const util = require('../../core/util');
const config = util.getConfig();

const BacktestAdapterExporter = function () {
  _.bindAll(this);
};

BacktestAdapterExporter.prototype.processBacktestResult = function (backtest) {
  console.info('BacktestExporter called, but not implemented.');
};

module.exports = BacktestAdapterExporter;
