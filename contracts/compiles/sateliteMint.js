// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

function compile_sateliteMintContract_from_source(contract_folder) {

    // create a path to the solidity file
    const CONTRACT_sateliteMint_PATH = path.resolve(contract_folder, 'sateliteMint.sol');
    const CONTRACT_ACCOUNTS_PATH = path.resolve(contract_folder, 'accounts.sol');
    // const CONTRACT_EXCHANGE_PATH = path.resolve(contract_folder, 'exchange.sol');
    const LIB_SAFEMATH_PATH = path.resolve(contract_folder, 'SafeMath.sol');
    const input = {
        'sateliteMint.sol': fs.readFileSync(CONTRACT_sateliteMint_PATH, 'utf8'),
        'accounts.sol': fs.readFileSync(CONTRACT_ACCOUNTS_PATH, 'utf8'),
        // 'exchange.sol': fs.readFileSync(CONTRACT_EXCHANGE_PATH, 'utf8'),
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
    const compiledsateliteMint = compilingResult.contracts['sateliteMint.sol:SateliteMint'];
    // compiledAcg721 = compilingResult.contracts['acg721.sol:ACG721'];
    if (!compiledsateliteMint) {
        console.log("Compiling contract failed, exit ...");
        return;
    }

    const sateliteMint = {
        abiString: compiledsateliteMint.interface,
        bytecode: '0x' + compiledsateliteMint.bytecode
    };
    console.log("accounts contract interface: ", compiledsateliteMint.interface);
    // const acg721 = {
    //     abiString: compiledAcg721.interface,
    //     bytecode: '0x' + compiledAcg721.bytecode
    // };

    const sateliteMintString = JSON.stringify(sateliteMint);
    // const acg721String = JSON.stringify(acg721);
    console.log("writting to Accounts.json file");

    fs.writeFileSync("./static/contractData/sateliteMint.json", sateliteMintString);
    // fs.writeFileSync("./static/ACG721.json", acg721String);

    return sateliteMint;
}
// const CONTRACT_FOLDER = path.resolve(__dirname, '..', 'contracts');
// compile_accountsContract_from_source(CONTRACT_FOLDER);
module.exports = compile_sateliteMintContract_from_source;