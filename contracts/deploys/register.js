const Web3 = require('web3');
const fs = require('fs');
const registerContract = require('../static/contractData/register.json');
// const register = require('../static/register.json');

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
    const instance_register = new web3.eth.Contract(JSON.parse(registerContract.abiString), null, {
        data: registerContract.bytecode
    });
    
    //receive info of ecr20 Data Contract
    const erc20Data = require('../static/contractData/erc20Data.json');
    const erc20DataDeployConf = require('../static/contractData/erc20DataDeployConf.json');
    const address_erc20Data = erc20DataDeployConf.address;
    const interface_erc20Data = JSON.parse(erc20Data.abiString);
    const instance_erc20Data = new web3.eth.Contract(interface_erc20Data, address_erc20Data);
    console.log(`received address of erc20 Data contract: ${address_erc20Data}`);

    // Estimate gas required to deploy the contracts
    const trans_estimate_gas = await instance_register.deploy().estimateGas();
    console.log(`Gas used to deploy contract register is ${trans_estimate_gas}`);

    // Deploy the contracts
    const new_instance_register = await instance_register.deploy().send({
        from: administrator,
        gas: Math.floor(trans_estimate_gas * 1.5)
    });
    const registerContractAddress = new_instance_register.options.address;
    console.log("Contracts deployed successfully ...\nregister is deployed at: ",
    registerContractAddress);
    
   
    // console.log("instance of Account Contract is: ", instance_erc20Data)
    // register register contract address to the accountContract
    try {
        const gasUsedregister = await instance_erc20Data.methods.setRegisterContractAddress(registerContractAddress).estimateGas({
            from: administrator,
        })
        await instance_erc20Data.methods.setRegisterContractAddress(registerContractAddress).send({
            from: administrator,
            gas: Math.floor(gasUsedregister * 1.5),
        })
        console.log("register register Contract address to Accountcontract successfully");
    } catch(err) {
        console.log("register register Contract address to Accountcontract failedly, ", err);
    }

    //register erc20 Data address to register contract
    try {
        const gasUsedErc20Data = await new_instance_register.methods.set_erc20DataContractAddr(address_erc20Data).estimateGas({
            from: administrator,
        })
        console.log(`gas used to register account contract address to register contract: ${gasUsedErc20Data}`);
        await new_instance_register.methods.set_erc20DataContractAddr(address_erc20Data).send({
            from: administrator,
            gas: Math.floor(gasUsedErc20Data * 1.5),
        })
        console.log("register erc20 Data Contract address to register contract successfully");
    } catch(err) {
        console.log("register erc20 Data Contract address to register contract failedly, ", err);
    }

    // //register this register address to the legitimate account list
    // try {
    //     const gasEstimate = await instance_erc20Data.methods.addAccount(registerContractAddress).estimateGas({
    //         from: administrator,
    //     });
    //     await instance_erc20Data.methods.addAccount(registerContractAddress).send({
    //         from: administrator,
    //         gas: Math.floor(gasEstimate * 1.5),
    //     });
    //     console.log(`Register account ${registerContractAddress} success`);
    // } catch(err) {
    //     console.log(`Register account ${registerContractAddress} failed with error:  ${err}`);
    // }
 

    const deployedConfig = {
        server: rpc_provider,
        administrator: administrator,
        address: new_instance_register.options.address,
        // register_address: newInstance20.options.address
    };

    const confString = JSON.stringify(deployedConfig);
    await fs.writeFileSync("./static/contractData/registerDeployConf.json", confString);
    console.log("Write register deployment result to file ...");
}

module.exports = deploy_new_contracts;
