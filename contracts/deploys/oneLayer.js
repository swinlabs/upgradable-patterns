const Web3 = require('web3');
const fs = require('fs');
const oneLayerContract = require('../static/contractData/oneLayer.json');

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
    console.log("byte code: ", oneLayerContract.bytecode);
    console.log("abi STring: ", oneLayerContract.abiString);
    // Generate new contract objects
    const instanceoneLayer = new web3.eth.Contract(JSON.parse(oneLayerContract.abiString), null, {
        data: oneLayerContract.bytecode
    });

    try {
        // Estimate gas required to deploy the contracts
        const trans_estimate_gas = await instanceoneLayer.deploy().estimateGas();
        // Deploy the contracts
        console.log("gas used is: ", trans_estimate_gas);
        console.log("admin account is", administrator);
        //need to unlock the administrator account
        
        const newInstanceoneLayer = await instanceoneLayer.deploy().send({
            from: administrator,
            gas: Math.floor(trans_estimate_gas * 1.2)
        });
        console.log("Contracts deployed successfully ...\noneLayer Contract is deployed at: ",
        newInstanceoneLayer.options.address);

        const deployedConfig = {
            server: rpc_provider,
            administrator: administrator,
            address: newInstanceoneLayer.options.address,
            // acg721_address: newInstance721.options.address
        };

        const confString = JSON.stringify(deployedConfig);
        await fs.writeFileSync("./static/contractData/oneLayerDeployConf.json", confString);
        console.log("Write oneLayer Contract deployment result to file ...");
    } catch (error) {
        console.log("something error here", error);
    }


    
}

//function to set address of this contract to proxy contract
async function _setContractAddress(logicAddress) {
    try {
        var gasUsed = await instanceUpgradeabilityProxy.methods._upgradeTo(logicAddress).estimateGas();
        console.log(`gas used to set address is ${gasUsed}`);
        const transHash = await instanceUpgradeabilityProxy.methods._upgradeTo(logicAddress).send({
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

module.exports = deploy_new_contracts;
