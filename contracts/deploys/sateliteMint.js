const Web3 = require('web3');
const fs = require('fs');
const sateliteMintContract = require('../static/contractData/sateliteMint.json');
// const sateliteMint = require('../static/sateliteMint.json');

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
    const instancesateliteMint = new web3.eth.Contract(JSON.parse(sateliteMintContract.abiString), null, {
        data: sateliteMintContract.bytecode
    });
    // instance20 = new web3.eth.Contract(JSON.parse(sateliteMint.abiString), null, {
    //     data: sateliteMint.bytecode
    // });

    // Estimate gas required to deploy the contracts
    const trans_estimate_gas = await instancesateliteMint.deploy().estimateGas();
    console.log(`Gas used to deploy contract sateliteMint is ${trans_estimate_gas}`);

    // Deploy the contracts
    const newinstancesateliteMint = await instancesateliteMint.deploy().send({
        from: administrator,
        gas: Math.floor(trans_estimate_gas * 1.5)
    });
    const sateliteMintContractAddress = newinstancesateliteMint.options.address;
    console.log("Contracts deployed successfully ...\nsateliteMint is deployed at: ",
    sateliteMintContractAddress);
    
    const dataSatelite = require('../static/contractData/dataSatelite.json');
    const dataSateliteDeployConf = require('../static/contractData/dataSateliteDeployConf.json');
    const address_dataSatelite = dataSateliteDeployConf.address;
    const interface_dataSatelite = JSON.parse(dataSatelite.abiString);
    const instancedataSatelite = new web3.eth.Contract(interface_dataSatelite, address_dataSatelite);
    // console.log("instance of Account Contract is: ", instancedataSatelite)
    // register sateliteMint contract address to the accountContract
    try {
        const gasUsedsateliteMint = await instancedataSatelite.methods.setMintContractAddress(sateliteMintContractAddress).estimateGas({
            from: administrator,
        })
        await instancedataSatelite.methods.setMintContractAddress(sateliteMintContractAddress).send({
            from: administrator,
            gas: Math.floor(gasUsedsateliteMint * 1.5),
        })
        console.log("register sateliteMint Contract address to Accountcontract successfully");
    } catch(err) {
        console.log("register sateliteMint Contract address to Accountcontract failedly, ", err);
    }

    //register account address to sateliteMint contract
    try {
        const gasUsedAccount = await newinstancesateliteMint.methods.setDataContractAddress(address_dataSatelite).estimateGas({
            from: administrator,
        })
        console.log(`gas used to register account contract address to sateliteMint contract: ${gasUsedAccount}`);
        await newinstancesateliteMint.methods.setDataContractAddress(address_dataSatelite).send({
            from: administrator,
            gas: Math.floor(gasUsedAccount * 1.5),
        })
        console.log("register Account Contract address to sateliteMint contract successfully");
    } catch(err) {
        console.log("register Account Contract address to sateliteMint contract failedly, ", err);
    }

    //register this sateliteMint address to the legitimate account list
    try {
        const gasEstimate = await instancedataSatelite.methods.addAccount(sateliteMintContractAddress).estimateGas({
            from: administrator,
        });
        await instancedataSatelite.methods.addAccount(sateliteMintContractAddress).send({
            from: administrator,
            gas: Math.floor(gasEstimate * 1.5),
        });
        console.log(`Register account ${sateliteMintContractAddress} success`);
    } catch(err) {
        console.log(`Register account ${sateliteMintContractAddress} failed with error:  ${err}`);
    }
 

    const deployedConfig = {
        server: rpc_provider,
        administrator: administrator,
        address: newinstancesateliteMint.options.address,
        // sateliteMint_address: newInstance20.options.address
    };

    const confString = JSON.stringify(deployedConfig);
    await fs.writeFileSync("./static/contractData/sateliteMintDeployConf.json", confString);
    console.log("Write sateliteMint deployment result to file ...");
}

module.exports = deploy_new_contracts;
