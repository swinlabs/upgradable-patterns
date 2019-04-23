// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

function compile_proxyLogicContract_from_source(contract_folder) {

    // create a path to the solidity file
    const CONTRACT_proxyLogic_PATH = path.resolve(contract_folder, 'proxyLogic.sol');
    // const CONTRACT_ACG721_PATH = path.resolve(contract_folder, 'acg721.sol');
    const LIB_SAFEMATH_PATH = path.resolve(contract_folder, 'SafeMath.sol');
    const input = {
        'proxyLogic.sol': fs.readFileSync(CONTRACT_proxyLogic_PATH, 'utf8'),
        'SafeMath.sol': fs.readFileSync(LIB_SAFEMATH_PATH, 'utf8')
    };
    const compilingResult = solc.compile({sources: input}, 1, (path) => {
        // Solc doesn't support importing from other folders
        // so resolve the missing files here
        if (path == "helpers/SafeMath.sol") {
            return {contents: fs.readFileSync('./helpers/SafeMath.sol', 'utf8') };
        } else {
            return {error: 'File not found'};
        }
    });
    // Output compiling error and warnings.
    if (compilingResult.errors) {
        compilingResult.errors.forEach((errInfo) => {
            console.log(errInfo);
        });
    }
    // Check if both contracts compiled successfully
    const compiledproxyLogic = compilingResult.contracts['proxyLogic.sol:ProxyLogic'];
    if (!compiledproxyLogic) {
        console.log("Compiling contract failed, exit ...");
        return;
    }

    const proxyLogic = {
        abiString: compiledproxyLogic.interface,
        bytecode: '0x' + compiledproxyLogic.bytecode
    };
    console.log("proxyLogic contract interface: ", compiledproxyLogic.interface);
    // const acg721 = {
    //     abiString: compiledAcg721.interface,
    //     bytecode: '0x' + compiledAcg721.bytecode
    // };

    const proxyLogicString = JSON.stringify(proxyLogic);
    // const acg721String = JSON.stringify(acg721);
    console.log("writting to proxyLogic.json file");

    fs.writeFileSync("./static/contractData/proxyLogic.json", proxyLogicString);
    // fs.writeFileSync("./static/ACG721.json", acg721String);

    return proxyLogic;
}
// const CONTRACT_FOLDER = path.resolve(__dirname, '..', 'contracts');
// compile_individualContract_from_source(CONTRACT_FOLDER);
module.exports = compile_proxyLogicContract_from_source;