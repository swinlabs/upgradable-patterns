const Web3 = require('web3');
const ethers = require('ethers');
var util = require('util'); 
// var {lock_account, unlock_account} = require('./common');

// Setup environment when this file is imported
let web3, administrator, admin_pwd;
_connect_to_chain("http");

// Fetch the deployed contracts from network
let instanceproxyLogic, instance_proxy, instance_testProxy, originalProxyLogic;
let interfaceproxyLogic, interface_proxy, interface_testProxy;
let addressProxyLogic, address_proxy, address_testProxy;
[instanceproxyLogic, instance_proxy, instance_testProxy, originalProxyLogic] = _retrieve_deployed_contracts();

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

function _retrieve_deployed_contracts() {
    const proxyLogic = require('../static/contractData/proxyLogic.json');
    const _proxy = require('../static/contractData/UpgradeabilityProxy.json');
    const testProxy = require('../static/contractData/testProxy.json');

    const proxyLogicDeployConf = require('../static/contractData/proxyLogicDeployConf.json');
    const _proxyDeployConf = require('../static/contractData/proxyDeployConf.json');
    const testProxyDeployConf = require('../static/contractData/testProxyDeployConf.json');

    addressProxyLogic = proxyLogicDeployConf.address;
    interfaceproxyLogic = JSON.parse(proxyLogic.abiString);
    address_proxy = _proxyDeployConf.address;
    interface_proxy = JSON.parse(_proxy.abiString);
    address_testProxy = testProxyDeployConf.address;
    interface_testProxy = JSON.parse(testProxy.abiString);
    console.log("Retrieve contract proxyLogic from ", addressProxyLogic);
    console.log("Retrieve contract _proxy from ", address_proxy);
    console.log("Retrieve contract testProxy from ", address_testProxy);

    //NOTE THE POINT OF USING PROXY CONTRACT HERE:
        //1. ABI: LOIGC CONTRACT ABI
        //2. ADDRESS: ADDRESS OF THE PROXY CONTRACT
    let _instanceproxyLogic = new web3.eth.Contract(interfaceproxyLogic, address_proxy);
    let _instance_proxy = new web3.eth.Contract(interface_proxy, address_proxy);
    let _instance_testProxy = new web3.eth.Contract(interface_testProxy, address_testProxy);
    let _originalProxyLogic = new web3.eth.Contract(interfaceproxyLogic, addressProxyLogic);

   

    return [_instanceproxyLogic, _instance_proxy, _instance_testProxy, _originalProxyLogic];
}

async function mint_original(_account, _amount) {
    console.log(`starting to mint from original`);
    try {
        //  await unlock_account(administrator, admin_pwd, 60*60);
        var gasUsed = await originalProxyLogic.methods.mint(_account, _amount).estimateGas();
        console.log(`gas used to mint is ${gasUsed}`);
        const transHash = await originalProxyLogic.methods.mint(_account, _amount).send({
            from: administrator,
            gas: Math.floor(gasUsed * 1.5)
        })
        console.log(`transaction hash received from mint: ${transHash}`);
        // await lock_account(administrator);
        return gasUsed;
    } catch (error) {
        console.log(`error with mint: ${error}`);
        return 0;
    }
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


async function registerAccount(user_address) {
    // Create a new account on the node
    try {
        // user_address = await web3.eth.personal.newAccount();
        console.log(`created account is : ${user_address}`);
        // regiser user
        try {
            // await unlock_account(administrator, admin_pwd, 60*60);
            const gasUsed = await instanceproxyLogic.methods.addAccount(user_address).estimateGas();
            console.log(`gas used to add account is ${gasUsed}`);
            const transHash = await instanceproxyLogic.methods.addAccount(user_address).send({
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
    // await lock_account(administrator);
    return user_address;
}

async function getRegisterAccounts() {
    const accounts = await instanceproxyLogic.methods.getAccounts().call();
    console.log(`list accounts registered are: ${util.inspect(accounts)}`);
}



async function mint_proxy(_account, _amount) {
    console.log(`starting to mint for acg 2o`);
    try {
        //  await unlock_account(administrator, admin_pwd, 60*60);
        var gasUsed = await instanceproxyLogic.methods.mint(_account, _amount).estimateGas();
        console.log(`gas used to mint is ${gasUsed}`);
        const transHash = await instanceproxyLogic.methods.mint(_account, _amount).send({
            from: administrator,
            gas: Math.floor(gasUsed * 1.5)
        })
        console.log(`transaction hash received from mint: ${transHash}`);
        // await lock_account(administrator);
        return gasUsed;
    } catch (error) {
        console.log(`error with mint: ${error}`);
        return 0;
    }
}

async function bulkMintTest(_transNumber) {
    const startTime = new Date();
    var endTime;
    var totalGasUsed = 0;
    for (var i = 0; i < _transNumber; i++) {
        totalGasUsed = totalGasUsed + await mint_proxy(fromUser, 1000);
        if (i == 99) {
            endTime = new Date();
            console.log(`time to perform is ${(endTime - startTime) / 1000}`);
        }
    }
    console.log(`total gased use to perform ${_transNumber} is ${totalGasUsed}`);
}

async function transfer(_from, _to, _amount) {
    try {
        var gasUsed = await instanceproxyLogic.methods.transfer(_to, _amount).estimateGas({
            from: _from
        });
        console.log(`gas used to transfer is ${gasUsed}`);
        const transHash = await instanceproxyLogic.methods.transfer(_to, _amount).send({
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
        totalGasUsed = totalGasUsed + await transfer(fromUser, toUser, 1);
        if (i == 99) {
            endTime = new Date();
            console.log(`time to perform is ${(endTime - startTime) / 1000}`);
        }
    }
    console.log(`total gased use to perform ${_transNumber} is ${totalGasUsed}`);
    
}

async function _setContractAddress() {
    var logicAddress = addressProxyLogic;
    try {
        var gasUsed = await instance_proxy.methods._upgradeTo(logicAddress).estimateGas();
        console.log(`gas used to set address is ${gasUsed}`);
        const transHash = await instance_proxy.methods._upgradeTo(logicAddress).send({
            from: administrator,
            gas: Math.floor(gasUsed * 1.5)
        })
        console.log(`transaction hash received from set address: ${transHash}`);
         return gasUsed;
    } catch (error) {
        console.log(`error with set address of logic contract: ${error}`);
        return 0;
    }
}

async function getCurrentLogicAddress() {
    try {
        var currentAddress = await instance_proxy.methods.getContractdAddress().call();
        console.log(`Current logic contract address is: ${currentAddress}`);
         return currentAddress;
    } catch (error) {
        console.log(`error with get address of logic contract: ${error}`);
        return '0x0';
    }
}

async function getBalanceOf(_address) {
    try {
        console.log(`starting get balance of ${_address}`)
        var currentBalance = await instanceproxyLogic.methods.get_balanceOf(_address).call();
        console.log(`Current ACG20 balance is: ${currentBalance}`);
        return currentBalance;
    } catch (error) {
        console.log(`error with get acg20 balance: ${error}`);
        return '0';
    }
}

async function registerProxyToLogic() {
    try {
        console.log(`address of proxy contract to be registered is ${address_proxy}`);
        var gasUsed = await instanceproxyLogic.methods.setProxyContractAddress(address_proxy).estimateGas();
        console.log(`gas used to register Proxy Address is ${gasUsed}`);
        const transHash = await instanceproxyLogic.methods.setProxyContractAddress(address_proxy).send({
            from: administrator,
            gas: Math.floor(gasUsed * 1.5)
        })
        console.log(`transaction hash received from register Proxy Address: ${transHash}`);
         return gasUsed;
    } catch (error) {
        console.log(`error with register Proxy Address: ${error}`);
        return 0;
    }
}

async function testMemory(_to) {
    var mintValue = [];
    for (var i =0; i< 100; i++) {
        mintValue[i] = 100;
    }
    try {
        var gasUsed = await instanceproxyLogic.methods.testMemory(
            _to, mintValue[1], mintValue[2], mintValue[3], mintValue[4], mintValue[5], mintValue[6], mintValue[7]
        ).estimateGas();
        console.log(`gas used to test Memory is ${gasUsed}`);
        const transHash = await instanceproxyLogic.methods.testMemory(
            _to, mintValue[1], mintValue[2], mintValue[3], mintValue[4], mintValue[5], mintValue[6], mintValue[7]
        ).send({
            from: administrator,
            gas: Math.floor(gasUsed * 1.5)
        })
        // var gasUsed = await instanceproxyLogic.methods.testMemory(
        //     _to, mintValue[1], mintValue[2], mintValue[3], mintValue[4], mintValue[5], mintValue[6], mintValue[7]
        // ).estimateGas();
        // console.log(`gas used to test Memory is ${gasUsed}`);
        // const transHash = await instanceproxyLogic.methods.testMemory(
        //     _to, mintValue[1], mintValue[2], mintValue[3], mintValue[4], mintValue[5], mintValue[6], mintValue[7]
        // ).send({
        //     from: administrator,
        //     gas: Math.floor(gasUsed * 1.5)
        // })
        console.log(`transaction hash received from test memory: ${transHash}`);
         return gasUsed;
    } catch (error) {
        console.log(`error with test memory: ${error}`);
        return 0;
    }
}

async function testAssembly(_to, _amount) {
    var mintValue = [];
    for (var i =0; i< 100; i++) {
        mintValue[i] = 100;
    }
    try {
        var gasUsed = await instanceproxyLogic.methods.testAssembly(
            _to, _amount
        ).estimateGas();
        console.log(`gas used to test Memory is ${gasUsed}`);
        const transHash = await instanceproxyLogic.methods.testAssembly(
            _to, _amount
        ).send({
            from: administrator,
            gas: Math.floor(gasUsed * 1.5)
        })
        console.log(`transaction hash received from test memory: ${transHash}`);
         return gasUsed;
    } catch (error) {
        console.log(`error with test memory: ${error}`);
        return 0;
    }
}

async function registerLogicToProxy() {
    try {        
        var gasUsed = await instance_proxy.methods._upgradeTo(addressProxyLogic).estimateGas();
        console.log(`gas used to register Proxy Address is ${gasUsed}`);
        const transHash = await instance_proxy.methods._upgradeTo(addressProxyLogic).send({
            from: administrator,
            gas: Math.floor(gasUsed * 1.5)
        })
        console.log(`transaction hash received from register Proxy Address: ${transHash}`);
         return gasUsed;
    } catch (error) {
        console.log(`error with register proxyLogic Address to Proxy: ${error}`);
        return 0;
    }
}

//THIS IS FOR THE TEST OF MEMORY OF PROXY CONTRACT
async function testMintMemory(_account, _amount1, _amount2) {
    console.log(`starting to mint for account ${_account}`);
    try {
        var gasUsed = await instance_testProxy.methods.testAssembly(_account, _amount1, _amount2).estimateGas();
        console.log(`gas used to mint is ${gasUsed}`);
        const transHash = await instance_testProxy.methods.testAssembly(_account, _amount1, _amount2).send({
            from: administrator,
            gas: Math.floor(gasUsed * 1.5)
        })
        console.log(`transaction hash received from mint: ${util.inspect(transHash, false, null)}`);
        // await lock_account(administrator);
        return transHash;
    } catch (error) {
        console.log(`error with mint: ${error}`);
        return 0;
    }
}

async function getMemoryValue() {
    try {
        var _before = await instance_proxy.methods.get_before().call();
        var _during = await instance_proxy.methods.get_during().call();
        var _after = await instance_proxy.methods.get_after().call();
        // var __during = await instanceproxyLogic.methods.get_duringLogic().call();
        var _testValue = await instanceproxyLogic.methods.get_testValue().call();
        var _logicMemorySize = await instanceproxyLogic.methods.get_logicMemorySize().call();
        // var ___during = await originalProxyLogic.methods.get_duringLogic().call();
        var _dataSize = await instance_proxy.methods.get_callDataSize().call();
        var _dataLoad = await instance_proxy.methods.get_callDataLoad().call();
        var _returnData = await instance_proxy.methods.get_returnDataLoad().call();
        var _proxyMemorySize = await instance_proxy.methods.get_proxyMemorySize().call();
        // var _returnSize = await instance_proxy.methods.get_returnDataSize().call();
        console.log(`value before from memory \n${_before}, \nValue during from memory\n${_during},
        \ntest value after from Proxy \n${_after}, \ntest value from proxyLogic \n${_testValue}`);
        console.log(`data size is ${_dataSize}, \n Data Loade is ${_dataLoad} \n`);
        console.log(`\n return data load is \n${_returnData}`);
        console.log(`\n proxy memory size: \n${_proxyMemorySize}`);
        console.log(`\n logic memory size: \n${_logicMemorySize}`);
        return [_before, _during, _after];
    } catch (error) {
        console.log(`error with get memory value ${error}`);
        return [0,0,0]
    }
}

async function test() {
    await _retrieve_deployed_contracts();

}
// test("");    
// getPersonalId();
// getPersonalInfo('0xe7d062f45DCd0002357ECeAf772302b43A077840');
// get_proxyInfo('0x5b6f626a65637420556e646566696e65645d0000000000000000000000000000');

const fromUser = '0x2017a83826281F7ABAD8451a36534e62F069110e';

const toUser = '0x8b31229b4e6D1B5C21A86A03a7AC1e256137d8fa';
// registerAccount(fromUser);
// registerAccount(toUser);
// registerAccount(address_testProxy);
// test();

// getRegisterAccounts();
// registerProxyToLogic();
// mint_proxy(fromUser, 1000);
// mint_original(fromUser, 500);
// bulkMintTest(100);
// transfer(fromUser, toUser, 100);
// bulkTransferTest(100);
// _setContractAddress();
// getCurrentLogicAddress();
// testMemory(fromUser);

// getBalanceOf(fromUser);
// getBalanceOf(toUser);
// testMintMemory(fromUser, 1000, 4000);
// registerLogicToProxy();
testAssembly(fromUser, 222);
getMemoryValue();
module.exports = {
    
    // ----------------------------
    // Auxiliary functions:
    // ----------------------------
    
};
