const promisify = require('tiny-promisify');

let util = require('../../core/util');
let config = util.getConfig();
let dirs = util.dirs();

let BacktestQuery = require(dirs.plugins + config.adapter + '/backtestQuery');

const queryApi = new BacktestQuery();

module.exports = function* () {
  const findById = promisify(queryApi.findById);
  const result = yield findById(this.params.id);
  if (!result) {
    this.body = {
      messages: 'Record not found'
    };
    this.status = 404;
    return;
  }
  this.body = result;



};
