const Web3 = require('web3');
const fs = require('fs');
const testProxyContract = require('../static/contractData/testProxy.json');
// const testProxy = require('../static/testProxy.json');

// const contract20 = {instance: ""};
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
    return web3;
}

async function deploy_new_contracts(rpc_provider, protocol) {
    // Connect to private chain
    await connect_to_chain(rpc_provider, protocol);

    // Generate new contract objects
    const instance_testProxy = new web3.eth.Contract(JSON.parse(testProxyContract.abiString), null, {
        data: testProxyContract.bytecode
    });
    
    //receive info of proxyLogic Contract
    const proxyLogic = require('../static/contractData/proxyLogic.json');
    const proxyLogicDeployConf = require('../static/contractData/proxyDeployConf.json');
    const address_proxyLogic = proxyLogicDeployConf.address;
    const interface_proxyLogic = JSON.parse(proxyLogic.abiString);
    const instance_proxyLogic = new web3.eth.Contract(interface_proxyLogic, address_proxyLogic);
    console.log(`received address of proxyLogic contract: ${address_proxyLogic}`);

    // Estimate gas required to deploy the contracts
    const trans_estimate_gas = await instance_testProxy.deploy({arguments: [address_proxyLogic]}).estimateGas();
    console.log(`Gas used to deploy contract testProxy is ${trans_estimate_gas}`);

    // Deploy the contracts
    const new_instance_testProxy = await instance_testProxy.deploy({arguments: [address_proxyLogic]}).send({
        from: administrator,
        gas: Math.floor(trans_estimate_gas * 1.5)
    });
    const testProxyContractAddress = new_instance_testProxy.options.address;
    console.log("Contracts deployed successfully ...\ntestProxy is deployed at: ",
    testProxyContractAddress);

    const deployedConfig = {
        server: rpc_provider,
        administrator: administrator,
        address: new_instance_testProxy.options.address,
        // testProxy_address: newInstance20.options.address
    };

    const confString = JSON.stringify(deployedConfig);
    await fs.writeFileSync("./static/contractData/testProxyDeployConf.json", confString);
    console.log("Write testProxy deployment result to file ...");
}

module.exports = deploy_new_contracts;
