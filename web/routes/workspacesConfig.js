let util = require('../../core/util');
let config = util.getConfig();

const workspaceSync = require('../../plugins/workspaceSync');

// Retrieves API information
module.exports = function *() {

  let req = this.request.body;

  console.info('Triggering manually to sync workspace with custom config', req);
  workspaceSync.start(req);
  this.body = {
    status: 'triggered successfully'
  };
};
