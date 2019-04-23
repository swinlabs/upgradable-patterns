const Web3 = require('web3');
const fs = require('fs');
const UpgradeabilityProxyContract = require('../static/contractData/UpgradeabilityProxy.json');
// const UpgradeabilityProxy = require('../static/UpgradeabilityProxy.json');

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
    const instance_UpgradeabilityProxy = new web3.eth.Contract(JSON.parse(UpgradeabilityProxyContract.abiString), null, {
        data: UpgradeabilityProxyContract.bytecode
    });
  

    // Estimate gas required to deploy the contracts
    const trans_estimate_gas = await instance_UpgradeabilityProxy.deploy().estimateGas();
    console.log(`Gas used to deploy contract UpgradeabilityProxy is ${trans_estimate_gas}`);

    // Deploy the contracts
    const new_instance_UpgradeabilityProxy = await instance_UpgradeabilityProxy.deploy().send({
        from: administrator,
        gas: Math.floor(trans_estimate_gas * 1.5)
    });
    const UpgradeabilityProxyContractAddress = new_instance_UpgradeabilityProxy.options.address;
    console.log("Contracts deployed successfully ...\nUpgradeabilityProxy is deployed at: ",
    UpgradeabilityProxyContractAddress);

    // //UpgradeabilityProxy this UpgradeabilityProxy address to the legitimate account list
    // try {
    //     const gasEstimate = await instance_erc20Data.methods.addAccount(UpgradeabilityProxyContractAddress).estimateGas({
    //         from: administrator,
    //     });
    //     await instance_erc20Data.methods.addAccount(UpgradeabilityProxyContractAddress).send({
    //         from: administrator,
    //         gas: Math.floor(gasEstimate * 1.5),
    //     });
    //     console.log(`UpgradeabilityProxy account ${UpgradeabilityProxyContractAddress} success`);
    // } catch(err) {
    //     console.log(`UpgradeabilityProxy account ${UpgradeabilityProxyContractAddress} failed with error:  ${err}`);
    // }
 

    const deployedConfig = {
        server: rpc_provider,
        administrator: administrator,
        address: new_instance_UpgradeabilityProxy.options.address,
        // UpgradeabilityProxy_address: newInstance20.options.address
    };

    const confString = JSON.stringify(deployedConfig);
    await fs.writeFileSync("./static/contractData/UpgradeabilityProxyDeployConf.json", confString);
    console.log("Write UpgradeabilityProxy deployment result to file ...");
}
// var Migrations = artifacts.require("./Migrations.sol");
// //var ArtChainToken = artifacts.require("ArtChainToken");
// var ACG20TOKEN = artifacts.require("ACG20");
// var ACG721TOKEN = artifacts.require("ACG721");
// var ACG20PROXY = artifacts.require("OwnedUpgradeabilityProxy");
// var ACG721PROXY = artifacts.require("OwnedUpgradeabilityProxy");

// module.exports = function(deployer) {
//   deployer.deploy(Migrations);
// //  deployer.deploy(ArtChainToken);

//   deployer.deploy(ACG20TOKEN).then(function() {
//     return deployer.deploy(ACG20PROXY, ACG20TOKEN.address);
//   });

//   deployer.deploy(ACG721TOKEN).then(function() {
//     return deployer.deploy(ACG721PROXY, ACG721TOKEN.address)
//   });
// };
module.exports = deploy_new_contracts;