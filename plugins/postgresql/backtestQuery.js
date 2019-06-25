const _ = require('lodash');

const BacktestQuery = function () {
  _.bindAll(this);
};

BacktestQuery.prototype.findByQuery = function (query, limit, callback) {
  callback(null, []);
};

BacktestQuery.prototype.findById = function (id, callback) {
  callback(null, null);
};

BacktestQuery.prototype.deleteById = function (id, callback) {
  callback(null, null);
};

module.exports = BacktestQuery;
