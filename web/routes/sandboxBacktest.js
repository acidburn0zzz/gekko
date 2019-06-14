const _ = require('lodash');
const promisify = require('tiny-promisify');
const pipelineRunner = promisify(require('../../core/workers/pipeline/parent'));

const fs = require('fs');
const util = require('../../core/util');
const dirs = util.dirs();
const uuidv4 = require('uuid/v4');

let moduleName = n => `${dirs.sandboxTmp}/${n}/${n}`;

/**
 * The Sandbox api allows a strategy be testes before be installed to a Live Gekko runs through the market.
 * It means that a sanbox strategy only will be allowed to Paper Trade and Backtest.
 *
 * @type {{stage: module.exports.stage, get: module.exports.get, list: module.exports.list, unstage: module.exports.unstage}}
 */
module.exports = function* () {

  let tempId = uuidv4();

  let name = this.request.body.name;
  let rawStrategy = this.request.body.rawStrategy;
  let settings = this.request.body.settings;
  let backtest = this.request.body.backtest;

  let dir = `${dirs.sandboxTmp}${tempId}/`;

  // Create temp file
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  let rawStrategyFile = `${moduleName(tempId)}.js`;
  fs.writeFileSync(rawStrategyFile, rawStrategy);

  // Just check if the strategy was imported successfully
  let strategy = require(moduleName(tempId));
  if (!strategy) {
    this.body = {
      messages: 'Bad request. Fail to compile strategy'
    };
    this.status = 400;
    return;
  }

  // Delete from cache, it avoids to node use caches while executing a loaded strategy
  delete require.cache[require.resolve(moduleName(tempId))];

  backtest.sandbox = {
    name: name,
    tempId: tempId,
    module: moduleName(tempId),
    settings: settings
  };

  var mode = 'backtest';

  var config = {};

  var base = require('./baseConfig');
  _.merge(config, base, backtest);

  this.body = yield pipelineRunner(mode, config);

  fs.unlinkSync(rawStrategyFile)
};
