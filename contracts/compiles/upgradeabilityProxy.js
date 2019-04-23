// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

function compile_UpgradeabilityProxyContract_from_source(contract_folder) {
    console.log(`prepare compile contract starting ...`);
    // create a path to the solidity file
    const contract_UpgradeabilityProxy_path = path.resolve(contract_folder, 'UpgradeabilityProxy.sol');
    const contract_Proxy_path = path.resolve(contract_folder, 'Proxy.sol');

    // const LIB_SAFEMATH_PATH = path.resolve(contract_folder, 'SafeMath.sol');
    const input = {
        'UpgradeabilityProxy.sol': fs.readFileSync(contract_UpgradeabilityProxy_path, 'utf8'),
        'Proxy.sol': fs.readFileSync(contract_Proxy_path, 'utf8'),
    };
    console.log(`compile starting`);
    const compilingResult = solc.compile({sources: input}, 1, (path) => {
        // Solc doesn't support importing from other folders
        // so resolve the missing files here
        if (path == "helpers/SafeMath.sol") {
            return {contents: fs.readFileSync('./helpers/SafeMath.sol', 'utf8') };
        } else {
            return {error: 'File not found'};
        }
    });
    console.log(`compile result is ${compilingResult}`);
    // Output compiling error and warnings.
    if (compilingResult.errors) {
        compilingResult.errors.forEach((errInfo) => {
            console.log(`Error from compiling contract: ${errInfo}`);
        });
    } else {
        console.log(`compile result is ${compilingResult}`);
    }
    // Check if both contracts compiled successfully
    const compiledUpgradeabilityProxy = compilingResult.contracts['UpgradeabilityProxy.sol:UpgradeabilityProxy'];
    // compiledAcg721 = compilingResult.contracts['acg721.sol:ACG721'];
    if (!compiledUpgradeabilityProxy) {
        console.log("Compiling contract failed, exit ...");
        return;
    }

    const UpgradeabilityProxy = {
        abiString: compiledUpgradeabilityProxy.interface,
        bytecode: '0x' + compiledUpgradeabilityProxy.bytecode
    };
    console.log("UpgradeabilityProxy contract interface: ", compiledUpgradeabilityProxy.interface);
  

    const UpgradeabilityProxyString = JSON.stringify(UpgradeabilityProxy);
    // const acg721String = JSON.stringify(acg721);
    console.log("writting to UpgradeabilityProxy.json file");

    fs.writeFileSync("./static/contractData/UpgradeabilityProxy.json", UpgradeabilityProxyString);
    // fs.writeFileSync("./static/ACG721.json", acg721String);

    return UpgradeabilityProxy;
}
const CONTRACT_FOLDER = path.resolve(__dirname, '..', 'contracts');
compile_UpgradeabilityProxyContract_from_source(CONTRACT_FOLDER);
module.exports = compile_UpgradeabilityProxyContract_from_source;