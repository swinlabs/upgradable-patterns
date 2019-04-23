const Web3 = require('web3');
const ethers = require('ethers');
var util = require('util'); 
var web3;
_connect_to_chain();

function _connect_to_chain(protocol) {
    //import the config of the chain
    const deployConf = require('../static/contractData/deployConfig.json');
    let web3Obj;
    // set the provider you want from Web3.providers
    if (protocol == "http") {
        web3Obj = new Web3(new Web3.providers.HttpProvider(deployConf.server));
    } else if (protocol == "ws") {
        web3Obj = new Web3(new Web3.providers.WebsocketProvider(deployConf.server));
    }
    // Exception is thrown if the connection failed
    //await web3Obj.eth.net.isListening();
    web3 = web3Obj;

    // Set administrator
    administrator = deployConf.administrator;

    console.log(`administrator address is ${administrator}`);
    admin_pwd = deployConf.password;
}


async function unlock_account(account_address, password, unlock_time=60*60) {
    let result = true;
    try {
        console.log(`unlocking account ${account_address} ...`);
        await web3.eth.personal.unlockAccount(account_address, password, unlock_time);
    } catch(err) {
        result = false;
        console.log("Something wrong with unlock account as ", err);
    }
    return result;
}

async function lock_account(account) {
    try {
        await web3.eth.personal.lockAccount(account);
        console.log(`lock account ${account} successfully`);
    } catch(err) {
        console.log(`lock account ${account} failed`);
    }
}

module.exports = {
    unlock_account,
    lock_account
    // ----------------------------
    // Auxiliary functions:
    // ----------------------------
    
};
