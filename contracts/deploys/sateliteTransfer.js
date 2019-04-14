const Web3 = require('web3');
const fs = require('fs');
const sateliteTransferContract = require('../static/contractData/sateliteTransfer.json');
// const sateliteTransfer = require('../static/sateliteTransfer.json');

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
    const instancesateliteTransfer = new web3.eth.Contract(JSON.parse(sateliteTransferContract.abiString), null, {
        data: sateliteTransferContract.bytecode
    });
    // instance20 = new web3.eth.Contract(JSON.parse(sateliteTransfer.abiString), null, {
    //     data: sateliteTransfer.bytecode
    // });

    // Estimate gas required to deploy the contracts
    const trans_estimate_gas = await instancesateliteTransfer.deploy().estimateGas();
    console.log(`Gas used to deploy contract sateliteTransfer is ${trans_estimate_gas}`);

    // Deploy the contracts
    const newinstancesateliteTransfer = await instancesateliteTransfer.deploy().send({
        from: administrator,
        gas: Math.floor(trans_estimate_gas * 1.5)
    });
    const sateliteTransferContractAddress = newinstancesateliteTransfer.options.address;
    console.log("Contracts deployed successfully ...\nsateliteTransfer is deployed at: ",
    sateliteTransferContractAddress);
    
    const dataSatelite = require('../static/contractData/dataSatelite.json');
    const dataSateliteDeployConf = require('../static/contractData/dataSateliteDeployConf.json');
    const address_dataSatelite = dataSateliteDeployConf.address;
    const interface_dataSatelite = JSON.parse(dataSatelite.abiString);
    const instancedataSatelite = new web3.eth.Contract(interface_dataSatelite, address_dataSatelite);
    // console.log("instance of Account Contract is: ", instancedataSatelite)
    // register sateliteTransfer contract address to the accountContract
    try {
        const gasUsedsateliteTransfer = await instancedataSatelite.methods.setTransferContractAddress(sateliteTransferContractAddress).estimateGas({
            from: administrator,
        })
        await instancedataSatelite.methods.setTransferContractAddress(sateliteTransferContractAddress).send({
            from: administrator,
            gas: Math.floor(gasUsedsateliteTransfer * 1.5),
        })
        console.log("register sateliteTransfer Contract address to DataSatelite contract successfully");
    } catch(err) {
        console.log("register sateliteTransfer Contract address to DataSatelite contract failedly, ", err);
    }

    //register account address to sateliteTransfer contract
    try {
        const gasUsedAccount = await newinstancesateliteTransfer.methods.setDataContractAddress(address_dataSatelite).estimateGas({
            from: administrator,
        })
        console.log(`gas used to register dataSatelite contract address ${address_dataSatelite} to sateliteTransfer contract: ${gasUsedAccount}`);
        await newinstancesateliteTransfer.methods.setDataContractAddress(address_dataSatelite).send({
            from: administrator,
            gas: Math.floor(gasUsedAccount * 1.5),
        })
        console.log("register DataSatelite Contract address to sateliteTransfer contract successfully");
    } catch(err) {
        console.log("register DataSatelite Contract address to sateliteTransfer contract failedly, ", err);
    }

    //register this sateliteTransfer address to the legitimate account list
    try {
        const gasEstimate = await instancedataSatelite.methods.addAccount(sateliteTransferContractAddress).estimateGas({
            from: administrator,
        });
        await instancedataSatelite.methods.addAccount(sateliteTransferContractAddress).send({
            from: administrator,
            gas: Math.floor(gasEstimate * 1.5),
        });
        console.log(`Adding account ${sateliteTransferContractAddress} success`);
    } catch(err) {
        console.log(`Adding account ${sateliteTransferContractAddress} failed with error:  ${err}`);
    }
 

    const deployedConfig = {
        server: rpc_provider,
        administrator: administrator,
        address: newinstancesateliteTransfer.options.address,
        // sateliteTransfer_address: newInstance20.options.address
    };

    const confString = JSON.stringify(deployedConfig);
    await fs.writeFileSync("./static/contractData/sateliteTransferDeployConf.json", confString);
    console.log("Write sateliteTransfer deployment result to file ...");
}

module.exports = deploy_new_contracts;
