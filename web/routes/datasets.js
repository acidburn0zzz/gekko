const _ = require('lodash');
const promisify = require('promisify-node');

const scan = promisify(require('../../core/workers/datasetScan/parent'));

// starts a scan
// requires a post body with configuration of:
// 
// - config.watch
const route = function* () {

  var config = require('./baseConfig');

  _.merge(config, this.request.body);

  let result = yield scan(config);

  if (result.error) {
    this.body = {
      errors: errors
    };
    this.status = 409;
    return;
  }
  this.body = result.datasets.map(d => ({id: d.exchange, ...d}));
};

module.exports = route;
