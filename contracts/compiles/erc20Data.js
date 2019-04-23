// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

function compile_erc20DataContract_from_source(contract_folder) {

    // create a path to the solidity file
    const contract_erc20Data_path = path.resolve(contract_folder, 'erc20Data.sol');
    // const CONTRACT_ACG721_PATH = path.resolve(contract_folder, 'acg721.sol');
    const lib_safemath_path = path.resolve(contract_folder, 'SafeMath.sol');
    const input = {
        'erc20Data.sol': fs.readFileSync(contract_erc20Data_path, 'utf8'),
        // 'acg721.sol': fs.readFileSync(CONTRACT_ACG721_PATH, 'utf8'),
        'SafeMath.sol': fs.readFileSync(lib_safemath_path, 'utf8')
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
    const compilederc20Data = compilingResult.contracts['erc20Data.sol:Erc20Data'];
    // compiledAcg721 = compilingResult.contracts['acg721.sol:ACG721'];
    if (!compilederc20Data) {
        console.log("Compiling contract failed, exit ...");
        return;
    }

    const erc20Data = {
        abiString: compilederc20Data.interface,
        bytecode: '0x' + compilederc20Data.bytecode
    };
    console.log("erc20Data contract interface: ", compilederc20Data.interface);
    // const acg721 = {
    //     abiString: compiledAcg721.interface,
    //     bytecode: '0x' + compiledAcg721.bytecode
    // };

    const erc20DataString = JSON.stringify(erc20Data);
    // const acg721String = JSON.stringify(acg721);
    console.log("writting to erc20Data.json file");

    fs.writeFileSync("./static/contractData/erc20Data.json", erc20DataString);
    // fs.writeFileSync("./static/ACG721.json", acg721String);

    return erc20Data;
}
// const CONTRACT_FOLDER = path.resolve(__dirname, '..', 'contracts');
// compile_erc20DataContract_from_source(CONTRACT_FOLDER);
module.exports = compile_erc20DataContract_from_source;