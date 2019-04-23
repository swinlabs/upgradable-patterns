// to compile solicity source code and export it as an ABI (interface) for accessing
const path = require('path');   //get cross platform
const fs = require('fs');
const solc = require('solc');

function compile_testProxyContract_from_source(contract_folder) {

    // create a path to the solidity file
    const contract_proxyLogic_path = path.resolve(contract_folder, 'proxyLogic.sol');
    const contract_testProxy_path = path.resolve(contract_folder, 'testProxy.sol');
    const LIB_SAFEMATH_PATH = path.resolve(contract_folder, 'SafeMath.sol');
    const input = {
        'proxyLogic.sol': fs.readFileSync(contract_proxyLogic_path, 'utf8'),
        'testProxy.sol': fs.readFileSync(contract_testProxy_path, 'utf8'),
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
    const compile_testProxy = compilingResult.contracts['testProxy.sol:TestProxy'];
    // compiledAcg721 = compilingResult.contracts['acg721.sol:ACG721'];
    if (!compile_testProxy) {
        console.log("Compiling contract testProxy failed, exit ...");
        return;
    }

    const testProxy = {
        abiString: compile_testProxy.interface,
        bytecode: '0x' + compile_testProxy.bytecode
    };
    console.log("testProxy contract interface: ", compile_testProxy.interface);
  

    const testProxyString = JSON.stringify(testProxy);

    console.log("writting to testProxy.json file");

    fs.writeFileSync("./static/contractData/testProxy.json", testProxyString);

    return testProxy;
}

module.exports = compile_testProxyContract_from_source;