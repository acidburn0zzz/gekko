let util = require('../../core/util');
let config = util.getConfig();
const workspaceSync = require('../../plugins/workspaceSync');
    
// Retrieves API information
module.exports = function *() {

  // TODO synchornize all instances (event bus publish to all)
  console.info('Triggering manually to sync workspace');
  workspaceSync.start(config.workspaceSync);
  this.body = {
    status: 'triggered successfully'
  };
}
