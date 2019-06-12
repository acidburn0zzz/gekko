const p = require('../../package.json');

// Retrieves API information
module.exports = function *() {
  this.body = {
    version: p.version,
    info: `${p.host}/v1/info`,
    workspaceSyncHook: `${p.host}/v1/workspaceSyncHook`
  }
}