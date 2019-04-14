// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

function compile_oneLayerContract_from_source(contract_folder) {

    // create a path to the solidity file
    const CONTRACT_oneLayer_PATH = path.resolve(contract_folder, 'oneLayer.sol');
    // const CONTRACT_ACG721_PATH = path.resolve(contract_folder, 'acg721.sol');
    const LIB_SAFEMATH_PATH = path.resolve(contract_folder, 'SafeMath.sol');
    const input = {
        'oneLayer.sol': fs.readFileSync(CONTRACT_oneLayer_PATH, 'utf8'),
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
    const compiledoneLayer = compilingResult.contracts['oneLayer.sol:OneLayer'];
    if (!compiledoneLayer) {
        console.log("Compiling contract failed, exit ...");
        return;
    }

    const oneLayer = {
        abiString: compiledoneLayer.interface,
        bytecode: '0x' + compiledoneLayer.bytecode
    };
    console.log("oneLayer contract interface: ", compiledoneLayer.interface);
    // const acg721 = {
    //     abiString: compiledAcg721.interface,
    //     bytecode: '0x' + compiledAcg721.bytecode
    // };

    const oneLayerString = JSON.stringify(oneLayer);
    // const acg721String = JSON.stringify(acg721);
    console.log("writting to oneLayer.json file");

    fs.writeFileSync("./static/contractData/oneLayer.json", oneLayerString);
    // fs.writeFileSync("./static/ACG721.json", acg721String);

    return oneLayer;
}
// const CONTRACT_FOLDER = path.resolve(__dirname, '..', 'contracts');
// compile_individualContract_from_source(CONTRACT_FOLDER);
module.exports = compile_oneLayerContract_from_source;