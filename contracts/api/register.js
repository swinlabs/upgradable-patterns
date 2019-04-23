const Web3 = require('web3');
const ethers = require('ethers');
var util = require('util'); 

// Setup environment when this file is imported
let web3, administrator;
_connect_to_chain("http");

// Fetch the deployed contracts from network
var fromUserAddress = '0xa8EbdB2ec57F8Cdf5e5E6C77F1cd410F03431c5B';
var toUserAddress = '0xbb63AAC1F63272346Dfe21CD542cfE3547202b7F';
var transferValue = 0.000000000000000000000000000000000000001;
let instanceerc20Logic, instanceerc20Data, instanceregister;
let interfaceerc20Logic, interfaceerc20Data, interfaceregister;
let addresserc20Logic, addresserc20Data, addressregister;
[instanceerc20Logic, instanceerc20Data, instanceregister] = _retrieve_deployed_contracts();

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
    const erc20Logic = require('../static/contractData/erc20Logic.json');
    const erc20Data = require('../static/contractData/erc20Data.json');
    const register = require('../static/contractData/register.json');

    const erc20LogicDeployConf = require('../static/contractData/erc20LogicDeployConf.json');
    const erc20DataTreeDeployConf = require('../static/contractData/erc20DataDeployConf.json');
    const registerDeployConf = require('../static/contractData/registerDeployConf.json');
 
    addresserc20Data = erc20DataTreeDeployConf.address;
    interfaceerc20Data = JSON.parse(erc20Data.abiString);
    addresserc20Logic = erc20LogicDeployConf.address;
    interfaceerc20Logic = JSON.parse(erc20Logic.abiString);
    addressregister = registerDeployConf.address;
    interfaceregister = JSON.parse(register.abiString);
    console.log("Retrieve contract erc20Logic from ", addresserc20Logic);
    console.log("Retrieve contract erc20Data from ", addresserc20Data);
    console.log("Retrieve contract register from ", addressregister);
    let _instanceerc20Data = new web3.eth.Contract(interfaceerc20Data, addresserc20Data);
    let _instanceerc20Logic = new web3.eth.Contract(interfaceerc20Logic, addresserc20Logic);
    let _instanceregister = new web3.eth.Contract(interfaceregister, addressregister);

   

    return [_instanceerc20Logic, _instanceerc20Data, _instanceregister];
}


async function registerAccount(user_address) {
    // Create a new account on the node
    try {
        // user_address = await web3.eth.personal.newAccount();
        console.log(`created account is : ${user_address}`);
        // regiser user
        try {
            const gasUsed = await instanceerc20Data.methods.addAccount(user_address).estimateGas();
            console.log(`gas used to add account is ${gasUsed}`);
            const transHash = await instanceerc20Data.methods.addAccount(user_address).send({
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

async function getRegistererc20Data() {
    const erc20Data = await instanceerc20Data.methods.getAccounts().call();
    console.log(`list erc20Data registered are: ${util.inspect(erc20Data)}`);
}

// test("");    
// getPersonalId();
// getPersonalInfo('0xe7d062f45DCd0002357ECeAf772302b43A077840');
// getsateliteInfo('0x5b6f626a65637420556e646566696e65645d0000000000000000000000000000');

async function getBalanceOf(_account) {
    try {
        const _balanceOf = await instanceerc20Data.methods.get_balanceOf(_account).call();
        console.log(`balance of account ${_account} is ${_balanceOf}`);
        return _balanceOf;
    } catch (error) {
        console.log(`error with get balance`);
        return 0;
    }
}


async function mint(_account, _amount) {
    console.log(`starting to mint for erc 2o`);
    try {
        const gasUsed = await instanceerc20Logic.methods.mint(_account, _amount).estimateGas();
        console.log(`gas used to mint is ${gasUsed}`);
        const transHash = await instanceerc20Logic.methods.mint(_account, _amount).send({
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

async function bulkMintTest(_transNumber, _address, _amount) {
    const startTime = new Date();
    var endTime;
    var totalGasUsed = 0;
    for (var i = 0; i < _transNumber; i++) {
        totalGasUsed = totalGasUsed + await mint(_address, _amount);
        if (i == 99) {
            endTime = new Date();
            console.log(`time to perform is ${(endTime - startTime) / 1000}`);
        }
    }
    console.log(`total gased use to perform ${_transNumber} is ${totalGasUsed}`);
}

async function transfer(_from, _to, _amount) {
    try {
        var gasUsed = await instanceerc20Logic.methods.transfer(_to, _amount).estimateGas();
        console.log(`gas used to transfer is ${gasUsed}`);
        const transHash = await instanceerc20Logic.methods.transfer(_to, _amount).send({
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

async function bulkTransferTest(_transNumber, _from, _to, _amount) {
    const startTime = new Date();
    var endTime;
    var totalGasUsed = 0;
    for (var i = 0; i < _transNumber; i++) {
        totalGasUsed = totalGasUsed + await transfer(_from, _to, _amount);
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



// registerAccount(fromUserAddress);

// registerAccount(toUserAddress);
getBalanceOf(fromUserAddress);
getBalanceOf(toUserAddress);
// getBalanceOf('0xB97295da9d4104ee9f8CC483E5266Ca85b4971b6')
// getBalanceOf(toUser);
// test();

// mint(fromUserAddress, 1000);
// bulkMintTest(100, fromUserAddress, 1000);
// transfer(fromUserAddress, toUserAddress, transferValue);
bulkTransferTest(100, fromUserAddress, toUserAddress, transferValue);

module.exports = {
    
    // ----------------------------
    // Auxiliary functions:
    // ----------------------------
    
};
