const promisify = require('tiny-promisify');

let util = require('../../core/util');
let config = util.getConfig();
let dirs = util.dirs();

let BacktestQuery = require(dirs.plugins + config.adapter + '/backtestQuery');

const queryApi = new BacktestQuery();

const mapQuery = filterAsString => {
  let query = {};
  let filter = JSON.parse(filterAsString || '{}');

  if(filter.id){
    query._id = filter.id;
  }
  if(filter.parentId){
    query.parentId = filter.parentId;
  }
  if (filter.market && filter.market.exchange) {
    query['market.exchange'] = filter.market.exchange;
  }
  if (filter.market && filter.market.currency) {
    query['market.currency'] = filter.market.currency;
  }
  if (filter.market && filter.market.asset) {
    query['market.asset'] = filter.market.asset;
  }
  if (filter.tradingAdvisor && filter.tradingAdvisor.method) {
    query['tradingAdvisor.method'] = filter.tradingAdvisor.method;
  }
  if (filter.onlyPositiveProfit) {
    query['performanceReport.relativeProfit'] = {$gte: 0};
  }

  if (filter.date_gte) {
    query['timestamp'] = {$gte: new Date(filter.date_gte)};
  }

  return query;
};

module.exports = function* () {
  const {filter, sort, all} = this.request.query;
  let limit = all ? null : 100;
  let query = mapQuery(filter);

  const findByQuery = promisify(queryApi.findByQuery);

  this.body = yield findByQuery(query, limit);
}
