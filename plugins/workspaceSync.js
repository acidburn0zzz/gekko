const util = require('../core/util');
const dirs = util.dirs();

const Git = require('nodegit');
const fs = require('fs');
const ncp = require('ncp').ncp;

const UPSTREAM = "origin/master";

const TEMP_DIR = dirs.scmTemp;
const TEMP_STRATEGIES_DIR = TEMP_DIR + '/strategies';
const TEMP_INDICATORS_DIR = TEMP_DIR + '/indicators';

let resolveWorkspace = (scm, username, password) => new Promise(function (resolve, reject) {
  if (!fs.existsSync(TEMP_DIR)) {
    Git.Clone(scm, TEMP_DIR, {
      fetchOpts: {
        callbacks: {
          credentials: () => Git.Cred.userpassPlaintextNew(username, password)
        }
      }
    }).then(repo => resolve(repo)).catch(err => reject(err));
    return;
  }
  Git.Repository.open(TEMP_DIR).then(repo => resolve(repo)).catch(err => reject(err));
});

let repo = null;
let procedure = (config) => resolveWorkspace(config.scm, config.scmUser, config.scmPassword)
  .then(r => {
    repo = r;
    return repo.fetchAll({
      callbacks: {
        credentials: () => Git.Cred.userpassPlaintextNew(config.scmUser, config.scmPassword)
      }
    })
  })
  .then(() => repo.mergeBranches("master", UPSTREAM))
  .then(() => ncp(TEMP_STRATEGIES_DIR, dirs.methods))
  .then(() => ncp(TEMP_INDICATORS_DIR, dirs.indicators))
  .then(() => console.info('Workspace is up to date'))
  .catch(err => console.error(err));

let interval = null;

const WorkspaceSync = {
  start: (config) => {
    console.info('Starting Workspace Sync');
    procedure(config);
  },

  startPeriodic: (config) => {
    console.info('Setting Workspace Sync interval for ' + config.syncInMilis + 'ms');
    procedure(config);
    interval = setInterval(() => procedure(config), config.syncInMilis);
  },

  stopPeriodic: () => delete interval
};
module.exports = WorkspaceSync;
