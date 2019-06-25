let util = require('../../core/util');
let dirs = util.dirs();

let combinatorics = require(dirs.plugins + '/combinatorics');

// Retrieves API information
module.exports = function* () {
  let spec = this.request.body;
  let result = combinatorics.map(spec);
  this.body = {
    original: spec,
    combinationsSize: result.length,
    combinations: result
  }
};
