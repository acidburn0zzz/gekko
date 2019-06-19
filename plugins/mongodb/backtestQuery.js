const _ = require('lodash');

const handle = require('./handle');
const mongoUtil = require('./util');

const BacktestQuery = function () {
  _.bindAll(this);
  this.db = handle;
  this.collection = this.db.collection(
    mongoUtil.settings.backtestResultCollection);
};

const summaryProjection = {
  _id: 1,
  timestamp: 1,
  exchange: 1,
  pair: 1,
  time: 1,
  "tradingAdvisor.method": 1,
  "performanceReport": 1
};

BacktestQuery.prototype.findByQuery = function (query, limit, callback) {

  this.collection.find(query, summaryProjection).limit(limit).sort(
    {timestamp: 1},
    (err, docs) => {
      callback(err, docs.map(d => ({id: d._id, ...d})));
    });
};

BacktestQuery.prototype.findById = function (id, callback) {
  this.collection.find({_id: id}, (err, docs) => {
    callback(err, _.first(docs.map(d => ({id: d._id, ...d}))));
  });
};

BacktestQuery.prototype.deleteById = function (id, callback) {
  this.collection.remove({_id: id}, (err, docs) => {
    callback(err, {id: id, message: `Backtest ${id} deleted successfully`});
  });
};

module.exports = BacktestQuery;
