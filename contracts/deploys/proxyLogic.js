const Web3 = require('web3');
const fs = require('fs');
const proxyLogicContract = require('../static/contractData/proxyLogic.json');
const proxyContractConf = require('../static/contractData/proxyDeployConf.json');
const proxyContract = require('../static/contractData/upgradeabilityProxy.json');

let web3;
let administrator;

async function connect_to_chain(rpc_provider, protocol) {
    if (typeof web3 !== 'undefined') {
        console.log("API: Connect to an existing web3 provider ...");
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        console.log("API: Set a new web3 provider ...");
        if (protocol == "http") {
            web3 = new Web3(new Web3.providers.HttpProvider(rpc_provider));
        } else if (protocol == "ws") {
            web3 = new Web3(new Web3.providers.WebsocketProvider(rpc_provider));
        }
    }
    // Exception is thrown if the connection failed
    await web3.eth.net.isListening();
    let accounts = await web3.eth.getAccounts();
    administrator = accounts[0];
    console.log("Connected to RPC server, set administrator to ", administrator, "...");
}

async function deploy_new_contracts(rpc_provider, protocol) {
    // Connect to private chain
    console.log(`starting connect to the chain ..`);
    await connect_to_chain(rpc_provider, protocol);
    console.log("byte code: ", proxyLogicContract.bytecode);
    console.log("abi STring: ", proxyLogicContract.abiString);
    // Generate new contract objects
    const instanceproxyLogic = new web3.eth.Contract(JSON.parse(proxyLogicContract.abiString), null, {
        data: proxyLogicContract.bytecode
    });

    try {
        // Estimate gas required to deploy the contracts
        const trans_estimate_gas = await instanceproxyLogic.deploy().estimateGas();
        // Deploy the contracts
        console.log("gas used is: ", trans_estimate_gas);
        console.log("admin account is", administrator);
        //need to unlock the administrator account
        
        const newInstanceproxyLogic = await instanceproxyLogic.deploy().send({
            from: administrator,
            gas: Math.floor(trans_estimate_gas * 1.2)
        });
        const _proxyLogicAddress = newInstanceproxyLogic.options.address;
        console.log("Contracts deployed successfully ...\nproxyLogic Contract is deployed at: ",
        _proxyLogicAddress);

        //get instance of UpgradeabilityProxy contract
        console.log(`start updating address ${_proxyLogicAddress} to proxy contract ..`);
        // await registerLogicToProxy(_proxyLogicAddress);
       

        const deployedConfig = {
            server: rpc_provider,
            administrator: administrator,
            address: newInstanceproxyLogic.options.address,
            // acg721_address: newInstance721.options.address
        };

        const confString = JSON.stringify(deployedConfig);
        await fs.writeFileSync("./static/contractData/proxyLogicDeployConf.json", confString);
        console.log("Write proxyLogic Contract deployment result to file ...");
    } catch (error) {
        console.log("something error here", error);
    }


    
}

async function registerLogicToProxy(_address_proxyLogic) {
    try {
        var _address_Proxy = proxyContractConf.address;
        console.log(`address of proxy contract is ${_address_Proxy}`);
        var _interface_Proxy = JSON.parse(proxyContract.abiString);
        console.log(`abi of proxy contract is ${_interface_Proxy}`);
        var _instance_proxy = new web3.eth.Contract(_interface_Proxy, _address_proxy);
        console.log(`address of proxyLogic contract to be registered is ${_address_proxyLogic}`);
        
        var gasUsed = await _instance_proxy.methods._upgradeTo(_address_proxyLogic).estimateGas();
        console.log(`gas used to register Proxy Address is ${gasUsed}`);
        const transHash = await _instance_proxy.methods._upgradeTo(_address_proxyLogic).send({
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

module.exports = deploy_new_contracts;
