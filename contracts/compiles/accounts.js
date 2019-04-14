// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

function compile_accountsContract_from_source(contract_folder) {

    // create a path to the solidity file
    const CONTRACT_ACCOUNTS_PATH = path.resolve(contract_folder, 'accounts.sol');
    // const CONTRACT_ACG721_PATH = path.resolve(contract_folder, 'acg721.sol');
    const LIB_SAFEMATH_PATH = path.resolve(contract_folder, 'SafeMath.sol');
    const input = {
        'accounts.sol': fs.readFileSync(CONTRACT_ACCOUNTS_PATH, 'utf8'),
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
    const compiledAccounts = compilingResult.contracts['accounts.sol:Accounts'];
    // compiledAcg721 = compilingResult.contracts['acg721.sol:ACG721'];
    if (!compiledAccounts) {
        console.log("Compiling contract failed, exit ...");
        return;
    }

    const accounts = {
        abiString: compiledAccounts.interface,
        bytecode: '0x' + compiledAccounts.bytecode
    };
    console.log("accounts contract interface: ", compiledAccounts.interface);
    // const acg721 = {
    //     abiString: compiledAcg721.interface,
    //     bytecode: '0x' + compiledAcg721.bytecode
    // };

    const accountsString = JSON.stringify(accounts);
    // const acg721String = JSON.stringify(acg721);
    console.log("writting to Accounts.json file");

    fs.writeFileSync("./static/contractData/Accounts.json", accountsString);
    // fs.writeFileSync("./static/ACG721.json", acg721String);

    return accounts;
}
// const CONTRACT_FOLDER = path.resolve(__dirname, '..', 'contracts');
// compile_accountsContract_from_source(CONTRACT_FOLDER);
module.exports = compile_accountsContract_from_source;