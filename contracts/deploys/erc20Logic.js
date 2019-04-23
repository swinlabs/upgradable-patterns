const Web3 = require('web3');
const fs = require('fs');
const erc20LogicContract = require('../static/contractData/erc20Logic.json');
// const erc20Logic = require('../static/erc20Logic.json');

const contract20 = {instance: ""};
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
    const instance_erc20Logic = new web3.eth.Contract(JSON.parse(erc20LogicContract.abiString), null, {
        data: erc20LogicContract.bytecode
    });
    
    //receive info of register Contract
    const register = require('../static/contractData/register.json');
    const registerDeployConf = require('../static/contractData/registerDeployConf.json');
    const address_register = registerDeployConf.address;
    const interface_register = JSON.parse(register.abiString);
    const instance_register = new web3.eth.Contract(interface_register, address_register);
    console.log(`received address of erc20 Data contract: ${address_register}`);

    // Estimate gas required to deploy the contracts
    const trans_estimate_gas = await instance_erc20Logic.deploy({arguments: [address_register]}).estimateGas();
    console.log(`Gas used to deploy contract erc20Logic is ${trans_estimate_gas}`);

    // Deploy the contracts
    const new_instance_erc20Logic = await instance_erc20Logic.deploy({arguments: [address_register]}).send({
        from: administrator,
        gas: Math.floor(trans_estimate_gas * 1.5)
    });
    const erc20LogicContractAddress = new_instance_erc20Logic.options.address;
    console.log("Contracts deployed successfully ...\nerc20Logic is deployed at: ",
    erc20LogicContractAddress);
    
   
    // REGISTER ERC20LOGIC CONTRACT TO REGISTER CONTRACT
    try {
        const gasUsederc20Logic = await instance_register.methods.set_erc20LoginContractAddr(erc20LogicContractAddress).estimateGas();
        await instance_register.methods.set_erc20LoginContractAddr(erc20LogicContractAddress).send({
            from: administrator,
            gas: Math.floor(gasUsederc20Logic * 1.5),
        })
        console.log("erc20Logic erc20Logic Contract address to Accountcontract successfully");
    } catch(err) {
        console.log("erc20Logic erc20Logic Contract address to Accountcontract failed, ", err);
    }

    //erc20Logic erc20 Data address to erc20Logic contract
    // try {
    //     const gasUsedregister = await new_instance_erc20Logic.methods.set_registerContractAddr(address_register).estimateGas({
    //         from: administrator,
    //     })
    //     console.log(`gas used to erc20Logic account contract address to erc20Logic contract: ${gasUsedregister}`);
    //     await new_instance_erc20Logic.methods.set_registerContractAddr(address_register).send({
    //         from: administrator,
    //         gas: Math.floor(gasUsedregister * 1.5),
    //     })
    //     console.log("erc20Logic erc20 Data Contract address to erc20Logic contract successfully");
    // } catch(err) {
    //     console.log("erc20Logic erc20 Data Contract address to erc20Logic contract failedly, ", err);
    // } 

    const deployedConfig = {
        server: rpc_provider,
        administrator: administrator,
        address: new_instance_erc20Logic.options.address,
        // erc20Logic_address: newInstance20.options.address
    };

    const confString = JSON.stringify(deployedConfig);
    await fs.writeFileSync("./static/contractData/erc20LogicDeployConf.json", confString);
    console.log("Write erc20Logic deployment result to file ...");
}

module.exports = deploy_new_contracts;
