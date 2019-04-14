const Web3 = require('web3');
const fs = require('fs');
const acg20Contract = require('../static/contractData/ACG20.json');
// const ACG20 = require('../static/ACG20.json');

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
    const instanceAcg20 = new web3.eth.Contract(JSON.parse(acg20Contract.abiString), null, {
        data: acg20Contract.bytecode
    });
    // instance20 = new web3.eth.Contract(JSON.parse(ACG20.abiString), null, {
    //     data: ACG20.bytecode
    // });

    // Estimate gas required to deploy the contracts
    const trans_estimate_gas = await instanceAcg20.deploy().estimateGas();
    console.log(`Gas used to deploy contract acg20 is ${trans_estimate_gas}`);

    // Deploy the contracts
    const newinstanceAcg20 = await instanceAcg20.deploy().send({
        from: administrator,
        gas: Math.floor(trans_estimate_gas * 1.5)
    });
    const acg20ContractAddress = newinstanceAcg20.options.address;
    console.log("Contracts deployed successfully ...\nACG20 is deployed at: ",
    acg20ContractAddress);
    
    const ACCOUNTS = require('../static/contractData/Accounts.json');
    const accountsDeployConf = require('../static/contractData/accountsDeployConf.json');
    const address_accounts = accountsDeployConf.address;
    const interface_accounts = JSON.parse(ACCOUNTS.abiString);
    const instanceAccounts = new web3.eth.Contract(interface_accounts, address_accounts);
    // console.log("instance of Account Contract is: ", instanceAccounts)
    // register acg20 contract address to the accountContract
    try {
        const gasUsedAcg20 = await instanceAccounts.methods.setAcg20ContractAddress(acg20ContractAddress).estimateGas({
            from: administrator,
        })
        await instanceAccounts.methods.setAcg20ContractAddress(acg20ContractAddress).send({
            from: administrator,
            gas: Math.floor(gasUsedAcg20 * 1.5),
        })
        console.log("register acg20 Contract address to Accountcontract successfully");
    } catch(err) {
        console.log("register acg20 Contract address to Accountcontract failedly, ", err);
    }

    //register account address to acg20 contract
    try {
        const gasUsedAccount = await newinstanceAcg20.methods.setAccountContractAddress(address_accounts).estimateGas({
            from: administrator,
        })
        console.log(`gas used to register account contract address to acg20 contract: ${gasUsedAccount}`);
        await newinstanceAcg20.methods.setAccountContractAddress(address_accounts).send({
            from: administrator,
            gas: Math.floor(gasUsedAccount * 1.5),
        })
        console.log("register Account Contract address to ACG20 contract successfully");
    } catch(err) {
        console.log("register Account Contract address to ACG20 contract failedly, ", err);
    }

    //register this acg20 address to the legitimate account list
    try {
        const gasEstimate = await instanceAccounts.methods.addAccount(acg20ContractAddress).estimateGas({
            from: administrator,
        });
        await instanceAccounts.methods.addAccount(acg20ContractAddress).send({
            from: administrator,
            gas: Math.floor(gasEstimate * 1.5),
        });
        console.log(`Register account ${acg20ContractAddress} success`);
    } catch(err) {
        console.log(`Register account ${acg20ContractAddress} failed with error:  ${err}`);
    }
 

    const deployedConfig = {
        server: rpc_provider,
        administrator: administrator,
        address: newinstanceAcg20.options.address,
        // acg20_address: newInstance20.options.address
    };

    const confString = JSON.stringify(deployedConfig);
    await fs.writeFileSync("./static/contractData/acg20DeployConf.json", confString);
    console.log("Write acg20 deployment result to file ...");
}

module.exports = deploy_new_contracts;
