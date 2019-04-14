const Web3 = require('web3');
const ethers = require('ethers');
var util = require('util'); 

// Setup environment when this file is imported
let web3, administrator;
_connect_to_chain("http");

// Fetch the deployed contracts from network
let instanceoneLayer, instanceaccounts, instanceacg20;
let interfaceoneLayer, interfaceaccounts, interfaceacg20;
let addressoneLayer, addressaccounts, addressacg20;
[instanceoneLayer, instanceaccounts, instanceacg20] = _retrieve_deployed_contracts();

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
    // admin_pwd = deployConf.password;
}

function _retrieve_deployed_contracts() {
    const oneLayer = require('../static/contractData/oneLayer.json');
    const accounts = require('../static/contractData/Accounts.json');
    const acg20 = require('../static/contractData/ACG20.json');

    const oneLayerDeployConf = require('../static/contractData/oneLayerDeployConf.json');
    const accountsTreeDeployConf = require('../static/contractData/accountsDeployConf.json');
    const acg20DeployConf = require('../static/contractData/acg20DeployConf.json');
 
    addressaccounts = accountsTreeDeployConf.address;
    interfaceaccounts = JSON.parse(accounts.abiString);
    addressoneLayer = oneLayerDeployConf.address;
    interfaceoneLayer = JSON.parse(oneLayer.abiString);
    addressacg20 = acg20DeployConf.address;
    interfaceacg20 = JSON.parse(acg20.abiString);
    console.log("Retrieve contract oneLayer from ", addressoneLayer);
    console.log("Retrieve contract accounts from ", addressaccounts);
    console.log("Retrieve contract acg20 from ", addressacg20);
    let _instanceaccounts = new web3.eth.Contract(interfaceaccounts, addressaccounts);
    let _instanceoneLayer = new web3.eth.Contract(interfaceoneLayer, addressoneLayer);
    let _instanceacg20 = new web3.eth.Contract(interfaceacg20, addressacg20);

   

    return [_instanceoneLayer, _instanceaccounts, _instanceacg20];
}


async function registerAccount(user_address) {
    // Create a new account on the node
    try {
        // user_address = await web3.eth.personal.newAccount();
        console.log(`created account is : ${user_address}`);
        // regiser user
        try {
            const gasUsed = await instanceaccounts.methods.addAccount(user_address).estimateGas();
            console.log(`gas used to add account is ${gasUsed}`);
            const transHash = await instanceaccounts.methods.addAccount(user_address).send({
                from: administrator,
                gas: Math.floor(gasUsed * 1.5)
            })
            console.log(`transaction hash received from adding account: ${transHash}`);
        } catch (error) {
            console.log(`error with adding account: ${error}`);
        }
    } catch(err) {
        console.log("Create new user failed ", err);
    }
    console.log(`address created is ${user_address}`);
    return user_address;
}

async function getRegisterAccounts() {
    const accounts = await instanceaccounts.methods.getAccounts().call();
    console.log(`list accounts registered are: ${util.inspect(accounts)}`);
}

// test("");    
// getPersonalId();
// getPersonalInfo('0xe7d062f45DCd0002357ECeAf772302b43A077840');
// getacg20Info('0x5b6f626a65637420556e646566696e65645d0000000000000000000000000000');



async function mintAcg20(_account, _amount) {
    console.log(`starting to mint for acg 2o`);
    try {
        const gasUsed = await instanceacg20.methods.mint(_account, _amount).estimateGas();
        console.log(`gas used to mint is ${gasUsed}`);
        const transHash = await instanceacg20.methods.mint(_account, _amount).send({
            from: administrator,
            gas: Math.floor(gasUsed * 1.5)
        })
        console.log(`transaction hash received from mint: ${transHash}`);
        return gasUsed;
    } catch (error) {
        console.log(`error with mint: ${error}`);
        return 0;
    }
}

async function bulkTest(_transNumber) {
    const startTime = new Date();
    var endTime;
    var totalGasUsed = 0;
    for (var i = 0; i < _transNumber; i++) {
        totalGasUsed = totalGasUsed + await mintAcg20(fromUser, 1000);
        if (i == 99) {
            endTime = new Date();
            console.log(`time to perform is ${(endTime - startTime) / 1000}`);
        }
    }
    console.log(`total gased use to perform ${_transNumber} is ${totalGasUsed}`);
}

async function transferAcg20(_from, _to, _amount) {
    try {
        var gasUsed = await instanceacg20.methods.transfer(_to, _amount).estimateGas({
            from: _from
        });
        console.log(`gas used to transfer is ${gasUsed}`);
        const transHash = await instanceacg20.methods.transfer(_to, _amount).send({
            from: _from,
            gas: Math.floor(gasUsed * 1.5)
        })
        console.log(`transaction hash received from transfer: ${transHash}`);
         return gasUsed;
    } catch (error) {
        console.log(`error with transfer: ${error}`);
        return 0;
    }
}

async function bulkTransferTest(_transNumber) {
    const startTime = new Date();
    var endTime;
    var totalGasUsed = 0;
    for (var i = 0; i < _transNumber; i++) {
        totalGasUsed = totalGasUsed + await transferAcg20(fromUser, toUser, 1);
        if (i == 99) {
            endTime = new Date();
            console.log(`time to perform is ${(endTime - startTime) / 1000}`);
        }
    }
    console.log(`total gased use to perform ${_transNumber} is ${totalGasUsed}`);
}

async function test() {
    await _retrieve_deployed_contracts();

}

const fromUser = '0xD4321831051BAcC6F83d092E270E8fa8ed9a98c6';
// registerAccount(fromUser);
const toUser = '0x6cADeaA4fcf00460e308CC04d6d937A9a59faA65';
// registerAccount(toUser);
// test();
getRegisterAccounts();
// mintAcg20(fromUser, 1000);
// bulkTest(100);
// transferAcg20(fromUser, toUser, 100);
bulkTransferTest(100);

module.exports = {
    
    // ----------------------------
    // Auxiliary functions:
    // ----------------------------
    
};
