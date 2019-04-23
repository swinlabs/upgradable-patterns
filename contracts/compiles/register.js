// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

function compile_registerContract_from_source(contract_folder) {

    // create a path to the solidity file
    const contract_register_path = path.resolve(contract_folder, 'register.sol');
    const contract_erc20Data_path = path.resolve(contract_folder, 'erc20Data.sol');
    // const CONTRACT_EXCHANGE_PATH = path.resolve(contract_folder, 'exchange.sol');
    const LIB_SAFEMATH_PATH = path.resolve(contract_folder, 'SafeMath.sol');
    const input = {
        'register.sol': fs.readFileSync(contract_register_path, 'utf8'),
        'erc20Data.sol': fs.readFileSync(contract_erc20Data_path, 'utf8'),
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
    const compiledregister = compilingResult.contracts['register.sol:Register'];
    // compiledAcg721 = compilingResult.contracts['acg721.sol:ACG721'];
    if (!compiledregister) {
        console.log("Compiling contract failed, exit ...");
        return;
    }

    const register = {
        abiString: compiledregister.interface,
        bytecode: '0x' + compiledregister.bytecode
    };
    console.log("register contract interface: ", compiledregister.interface);
  

    const registerString = JSON.stringify(register);
    // const acg721String = JSON.stringify(acg721);
    console.log("writting to Accounts.json file");

    fs.writeFileSync("./static/contractData/register.json", registerString);
    // fs.writeFileSync("./static/ACG721.json", acg721String);

    return register;
}
// const CONTRACT_FOLDER = path.resolve(__dirname, '..', 'contracts');
// compile_accountsContract_from_source(CONTRACT_FOLDER);
module.exports = compile_registerContract_from_source;