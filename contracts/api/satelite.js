const Web3 = require('web3');
const ethers = require('ethers');
var util = require('util'); 

// Setup environment when this file is imported
let web3, administrator;
_connect_to_chain("http");

// Fetch the deployed contracts from network
var fromUserAddress = '0xB97295da9d4104ee9f8CC483E5266Ca85b4971b6';
var toUserAddress = '0x1bDc516a03f758B21368ce8f67f1991c6aE4E4B1';
let instancesateliteMint, instancedataSatelite, instancesateliteTransfer;
let interfacesateliteMint, interfacedataSatelite, interfacesateliteTransfer;
let addresssateliteMint, addressdataSatelite, addresssateliteTransfer;
[instancesateliteMint, instancedataSatelite, instancesateliteTransfer] = _retrieve_deployed_contracts();

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
    const sateliteMint = require('../static/contractData/sateliteMint.json');
    const dataSatelite = require('../static/contractData/dataSatelite.json');
    const sateliteTransfer = require('../static/contractData/sateliteTransfer.json');

    const sateliteMintDeployConf = require('../static/contractData/sateliteMintDeployConf.json');
    const dataSateliteTreeDeployConf = require('../static/contractData/dataSateliteDeployConf.json');
    const sateliteTransferDeployConf = require('../static/contractData/sateliteTransferDeployConf.json');
 
    addressdataSatelite = dataSateliteTreeDeployConf.address;
    interfacedataSatelite = JSON.parse(dataSatelite.abiString);
    addresssateliteMint = sateliteMintDeployConf.address;
    interfacesateliteMint = JSON.parse(sateliteMint.abiString);
    addresssateliteTransfer = sateliteTransferDeployConf.address;
    interfacesateliteTransfer = JSON.parse(sateliteTransfer.abiString);
    console.log("Retrieve contract sateliteMint from ", addresssateliteMint);
    console.log("Retrieve contract dataSatelite from ", addressdataSatelite);
    console.log("Retrieve contract sateliteTransfer from ", addresssateliteTransfer);
    let _instancedataSatelite = new web3.eth.Contract(interfacedataSatelite, addressdataSatelite);
    let _instancesateliteMint = new web3.eth.Contract(interfacesateliteMint, addresssateliteMint);
    let _instancesateliteTransfer = new web3.eth.Contract(interfacesateliteTransfer, addresssateliteTransfer);

   

    return [_instancesateliteMint, _instancedataSatelite, _instancesateliteTransfer];
}


async function registerAccount(user_address) {
    // Create a new account on the node
    try {
        // user_address = await web3.eth.personal.newAccount();
        console.log(`created account is : ${user_address}`);
        // regiser user
        try {
            const gasUsed = await instancedataSatelite.methods.addAccount(user_address).estimateGas();
            console.log(`gas used to add account is ${gasUsed}`);
            const transHash = await instancedataSatelite.methods.addAccount(user_address).send({
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

async function getRegisterdataSatelite() {
    const dataSatelite = await instancedataSatelite.methods.getAccounts().call();
    console.log(`list dataSatelite registered are: ${util.inspect(dataSatelite)}`);
}

// test("");    
// getPersonalId();
// getPersonalInfo('0xe7d062f45DCd0002357ECeAf772302b43A077840');
// getsateliteInfo('0x5b6f626a65637420556e646566696e65645d0000000000000000000000000000');

async function getBalanceOf(_account) {
    try {
        const _balanceOf = await instancedataSatelite.methods.getAcg20BalanceOf(_account).call();
        console.log(`balance of account ${_account} is ${_balanceOf}`);
        return _balanceOf;
    } catch (error) {
        console.log(`error with get balance`);
        return 0;
    }
}


async function mintsatelite(_account, _amount) {
    console.log(`starting to mint for acg 2o`);
    try {
        const gasUsed = await instancesateliteMint.methods.mint(_account, _amount).estimateGas();
        console.log(`gas used to mint is ${gasUsed}`);
        const transHash = await instancesateliteMint.methods.mint(_account, _amount).send({
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
        totalGasUsed = totalGasUsed + await mintsatelite(_address, _amount);
        if (i == 99) {
            endTime = new Date();
            console.log(`time to perform is ${(endTime - startTime) / 1000}`);
        }
    }
    console.log(`total gased use to perform ${_transNumber} is ${totalGasUsed}`);
}

async function transfersatelite(_from, _to, _amount) {
    try {
        var gasUsed = await instancesateliteTransfer.methods.transfer(_to, _amount).estimateGas();
        console.log(`gas used to transfer is ${gasUsed}`);
        const transHash = await instancesateliteTransfer.methods.transfer(_to, _amount).send({
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
        totalGasUsed = totalGasUsed + await transfersatelite(_from, _to, _amount);
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



// registerAccount(fromUser);

// registerAccount(toUser);
getBalanceOf(fromUserAddress);
getBalanceOf('0xB97295da9d4104ee9f8CC483E5266Ca85b4971b6')
// getBalanceOf(toUser);
// test();
// getRegisterdataSatelite();
// mintsatelite(fromUser, 1000);
// bulkMintTest(100, fromUser, 1000);
// transfersatelite('0xB97295da9d4104ee9f8CC483E5266Ca85b4971b6', toUserAddress, 0.0000000000000000000000000000000000001);
bulkTransferTest(100, fromUserAddress, toUserAddress, 0.0000000000000000000000000000000000001);

module.exports = {
    
    // ----------------------------
    // Auxiliary functions:
    // ----------------------------
    
};
