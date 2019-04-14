const Web3 = require('web3');
const fs = require('fs');
const victimContract = require('../static/contractData/victim.json');

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
    console.log("byte code: ", victimContract.bytecode);
    console.log("abi STring: ", victimContract.abiString);
    // Generate new contract objects
    const instanceVictim = new web3.eth.Contract(JSON.parse(victimContract.abiString), null, {
        data: victimContract.bytecode
    });

    try {
        // Estimate gas required to deploy the contracts
        const trans_estimate_gas = await instanceVictim.deploy().estimateGas();
        // Deploy the contracts
        console.log("gas used is: ", trans_estimate_gas);
        console.log("admin account is", administrator);
        //need to unlock the administrator account
        
        const newInstanceVictim = await instanceVictim.deploy().send({
            from: administrator,
            gas: Math.floor(trans_estimate_gas * 1.2)
        });
        console.log("Contracts deployed successfully ...\nvictim Contract is deployed at: ",
        newInstanceVictim.options.address);

        const deployedConfig = {
            server: rpc_provider,
            administrator: administrator,
            address: newInstanceVictim.options.address,
            // acg721_address: newInstance721.options.address
        };

        const confString = JSON.stringify(deployedConfig);
        await fs.writeFileSync("./static/contractData/victimDeployConf.json", confString);
        console.log("Write victim Contract deployment result to file ...");
    } catch (error) {
        console.log("something error here", error);
    }


    
}

module.exports = deploy_new_contracts;
