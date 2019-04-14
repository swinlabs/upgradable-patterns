// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

function compile_dataSateliteContract_from_source(contract_folder) {

    // create a path to the solidity file
    const CONTRACT_dataSatelite_PATH = path.resolve(contract_folder, 'dataSatelite.sol');
    // const CONTRACT_ACG721_PATH = path.resolve(contract_folder, 'acg721.sol');
    const LIB_SAFEMATH_PATH = path.resolve(contract_folder, 'SafeMath.sol');
    const input = {
        'dataSatelite.sol': fs.readFileSync(CONTRACT_dataSatelite_PATH, 'utf8'),
        // 'acg721.sol': fs.readFileSync(CONTRACT_ACG721_PATH, 'utf8'),
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
    const compileddataSatelite = compilingResult.contracts['dataSatelite.sol:DataSatelite'];
    // compiledAcg721 = compilingResult.contracts['acg721.sol:ACG721'];
    if (!compileddataSatelite) {
        console.log("Compiling contract failed, exit ...");
        return;
    }

    const dataSatelite = {
        abiString: compileddataSatelite.interface,
        bytecode: '0x' + compileddataSatelite.bytecode
    };
    console.log("dataSatelite contract interface: ", compileddataSatelite.interface);
    // const acg721 = {
    //     abiString: compiledAcg721.interface,
    //     bytecode: '0x' + compiledAcg721.bytecode
    // };

    const dataSateliteString = JSON.stringify(dataSatelite);
    // const acg721String = JSON.stringify(acg721);
    console.log("writting to dataSatelite.json file");

    fs.writeFileSync("./static/contractData/dataSatelite.json", dataSateliteString);
    // fs.writeFileSync("./static/ACG721.json", acg721String);

    return dataSatelite;
}
// const CONTRACT_FOLDER = path.resolve(__dirname, '..', 'contracts');
// compile_dataSateliteContract_from_source(CONTRACT_FOLDER);
module.exports = compile_dataSateliteContract_from_source;