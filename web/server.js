let util = require('../core/util');
let config = util.getConfig();

const koa = require('koa');
const serve = require('koa-static');
const cors = require('koa-cors');
const _ = require('lodash');
const bodyParser = require('koa-bodyparser');

const server = require('http').createServer();
const router = require('koa-router')();
const app = koa();

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({server: server});

const cache = require('./state/cache');

wss.on('connection', ws => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  ws.ping(_.noop);
  ws.on('error', e => {
    console.error(new Date, '[WS] connection error:', e);
  });
});

setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) {
      console.log(new Date, '[WS] stale websocket client, terminiating..');
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(_.noop);
  });
}, 10 * 1000);

// broadcast function
const broadcast = data => {
  if (_.isEmpty(data)) {
    return;
  }

  const payload = JSON.stringify(data);

  wss.clients.forEach(ws => {
      ws.send(payload, err => {
        if (err) {
          console.log(new Date, '[WS] unable to send data to client:', err);
        }
      });
    }
  );
}
cache.set('broadcast', broadcast);

const ListManager = require('./state/listManager');
const GekkoManager = require('./state/gekkoManager');

// initialize lists and dump into cache
cache.set('imports', new ListManager);
cache.set('gekkos', new GekkoManager);
cache.set('apiKeyManager', require('./apiKeyManager'));

// setup API routes
const WEBROOT = __dirname + '/';
const ROUTE = n => WEBROOT + 'routes/' + n;

// attach routes
const apiKeys = require(ROUTE('apiKeys'));
router.get('/api/info', require(ROUTE('info')));
router.get('/api/config', require(ROUTE('config')));
router.get('/api/strategies', require(ROUTE('strategies')));
router.get('/api/configPart/:part', require(ROUTE('configPart')));
router.get('/api/apiKeys', apiKeys.get);

router.get('/api/backtests', require(ROUTE('backtests')));
router.get('/api/backtests/:id', require(ROUTE('backtestResult')));
router.delete('/api/backtests/:id', require(ROUTE('backtestDeleteResult')));
router.get('/api/datasets', require(ROUTE('datasets')));
router.post('/api/utils/backtests/combinations', require(ROUTE('backtestsCombinations')));
router.post('/api/utils/backtests/validate', require(ROUTE('backtestsValidate')));

router.post('/api/v1/workspaces', require(ROUTE('workspacesConfig')));
router.get('/api/v1/workspaceSyncHook', require(ROUTE('workspaceSyncHook')));
router.post('/api/v1/workspaceSyncHook', require(ROUTE('workspaceSyncHook')));

const listWraper = require(ROUTE('list'));
router.get('/api/imports', listWraper('imports'));
router.get('/api/gekkos', listWraper('gekkos'));
router.get('/api/exchanges', require(ROUTE('exchanges')));


router.post('/api/addApiKey', apiKeys.add);
router.post('/api/removeApiKey', apiKeys.remove);
router.post('/api/scan', require(ROUTE('scanDateRange')));
router.post('/api/scansets', require(ROUTE('scanDatasets')));
router.post('/api/backtest', require(ROUTE('backtest')));
router.post('/api/startGekko', require(ROUTE('startGekko')));
router.post('/api/stopGekko', require(ROUTE('stopGekko')));
router.post('/api/deleteGekko', require(ROUTE('deleteGekko')));
router.post('/api/getCandles', require(ROUTE('getCandles')));


// Keep legacy ui working
router.post('/api/import', require(ROUTE('import')));
router.post('/api/imports', require(ROUTE('multiImport')));

// Sandbox API
router.post('/api/sandboxBacktest', require(ROUTE('sandboxBacktest')));

app
.use(cors())
.use(serve(WEBROOT + 'vue/dist'))
.use(bodyParser())
.use(require('koa-logger')())
.use(router.routes())
.use(router.allowedMethods());

server.timeout = config.api.timeout || 120000;
server.on('request', app.callback());
server.listen(config.api.port, config.api.host, '::', () => {
  const host = `${config.api.host}:${config.api.port}`;
  console.log(`Serving Gekko API on http://${host}\n`);

  if(config.workspaceSync.enabled){
    const workspaceSync = require('../plugins/workspaceSync');
    workspaceSync.startPeriodic(config.workspaceSync);
  }
});
