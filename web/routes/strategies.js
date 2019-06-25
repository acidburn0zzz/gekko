const util = require('../../core/util');
const dirs = util.dirs();
const fs = require('co-fs');
const _fs = require('fs');
const reader = _fs.readFileSync;
const exists = _fs.existsSync;


module.exports = function* () {

  const strategyDir = yield fs.readdir(dirs.methods);
  this.body = strategyDir
  .filter(f => !f.includes('.DS_Store'))
  .filter(f => !f.startsWith('_'))
  .map(name => {
    let param = '';
    let paramFileName = `${dirs.methods}${name}/${name}.toml`;

    if(exists(paramFileName)){
      param = reader(paramFileName).toString('utf8')
    }

    return {
      "name": name,
      "params" : param
    }
  });
};
