// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

function compile_erc20LogicContract_from_source(contract_folder) {

    // create a path to the solidity file
    const contract_register_path = path.resolve(contract_folder, 'register.sol');
    const contract_erc20Data_path = path.resolve(contract_folder, 'erc20Data.sol');
    const contract_erc20Logic_path = path.resolve(contract_folder, 'erc20Logic.sol');
    const LIB_SAFEMATH_PATH = path.resolve(contract_folder, 'SafeMath.sol');
    const input = {
        'register.sol': fs.readFileSync(contract_register_path, 'utf8'),
        'erc20Data.sol': fs.readFileSync(contract_erc20Data_path, 'utf8'),
        'erc20Logic.sol': fs.readFileSync(contract_erc20Logic_path, 'utf8'),
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
    const compile_erc20Logic = compilingResult.contracts['erc20Logic.sol:Erc20Logic'];
    // compiledAcg721 = compilingResult.contracts['acg721.sol:ACG721'];
    if (!compile_erc20Logic) {
        console.log("Compiling contract erc20Logic failed, exit ...");
        return;
    }

    const erc20Logic = {
        abiString: compile_erc20Logic.interface,
        bytecode: '0x' + compile_erc20Logic.bytecode
    };
    console.log("erc20Logic contract interface: ", compile_erc20Logic.interface);
  

    const erc20LogicString = JSON.stringify(erc20Logic);

    console.log("writting to erc20Logic.json file");

    fs.writeFileSync("./static/contractData/erc20Logic.json", erc20LogicString);

    return erc20Logic;
}

module.exports = compile_erc20LogicContract_from_source;