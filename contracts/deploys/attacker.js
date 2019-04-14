const Web3 = require('web3');
const fs = require('fs');
const attackerContract = require('../static/contractData/attacker.json');

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
    console.log("byte code: ", attackerContract.bytecode);
    console.log("abi STring: ", attackerContract.abiString);
    // Generate new contract objects
    const instanceattacker = new web3.eth.Contract(JSON.parse(attackerContract.abiString), null, {
        data: attackerContract.bytecode
    });

    //get victim contract address
    const victimConfig = require('../static/contractData/victimDeployConf.json');
    const victimContractAddress = victimConfig.address;
    console.log(`victim address is ${victimContractAddress}`);

    try {
        // Estimate gas required to deploy the contracts
        const trans_estimate_gas = await instanceattacker.deploy().estimateGas();
        // Deploy the contracts
        console.log("gas used is: ", trans_estimate_gas);
        console.log("admin account is", administrator);
        //need to unlock the administrator account
        
        const newInstanceattacker = await instanceattacker.deploy().send({
            from: administrator,
            gas: Math.floor(trans_estimate_gas * 1.2)
        });
        console.log("Contracts deployed successfully ...\nattacker Contract is deployed at: ",
        newInstanceattacker.options.address);

        const deployedConfig = {
            server: rpc_provider,
            administrator: administrator,
            address: newInstanceattacker.options.address,
            // acg721_address: newInstance721.options.address
        };

        //then set the victim address into attacker contract
        try {
            const gasEstimate = await newInstanceattacker.methods.setVictimAddress(victimContractAddress).estimateGas({
                from: administrator,
            });
            await newInstanceattacker.methods.setVictimAddress(victimContractAddress).send({
                from: administrator,
                gas: Math.floor(gasEstimate * 1.5),
            });
            console.log("Register victim contract to decisionTree Contract successfully");
        } catch (err) {
            console.log("Failed to register victim contract to decisionTree: ", err);
        }

        const confString = JSON.stringify(deployedConfig);
        await fs.writeFileSync("./static/contractData/attackerDeployConf.json", confString);
        console.log("Write attacker Contract deployment result to file ...");
    } catch (error) {
        console.log("something error here", error);
    }   
}

module.exports = deploy_new_contracts;
