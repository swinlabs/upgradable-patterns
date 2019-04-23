const path = require('path');
const deployConfig = require('../static/contractData/deployConfig.json');

const COMPILE = require('../compiles/erc20Data.js');
const CONTRACT_FOLDER = path.resolve(__dirname, '..', 'contracts');
COMPILE(CONTRACT_FOLDER);

const DEPLOY = require('../deploys/erc20Data.js');
//const RPC_SERVER = "http://127.0.0.1:32000";      // local
const RPC_SERVER = deployConfig.server;   // Ali1

DEPLOY(RPC_SERVER, "http");

return;