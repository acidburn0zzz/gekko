let util = require('../../core/util');
let config = util.getConfig();

// Retrieves API information
module.exports = function *() {

  this.body = {
    ...config
  }
};
