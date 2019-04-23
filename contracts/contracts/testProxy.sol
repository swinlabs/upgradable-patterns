//call the mint method on proxy
//use the memory
    pragma solidity ^0.4.24;

import "./SafeMath.sol";
// import "./accounts.sol";

contract ProxyLogicInterface {
    function transfer(address _to, uint256 _value) public returns (bool);
    function mint(address _to, uint256 _amount) public returns(bool);
}

contract TestProxy {
    using SafeMath for uint256;
    bytes32 public name = "JUST FOR TESTING";
    uint8 public decimals = 2;
    ProxyLogicInterface public proxyLogic;

    constructor(address _proxyLogicAddress) public {
        proxyLogic = ProxyLogicInterface(_proxyLogicAddress);
    }

    function testAssembly(address _to, uint256 _first, uint256 _second) public returns (uint256 beforeProxy) {
        uint256 _totalBefore = _first + _second;
        beforeProxy = 2 * _totalBefore;
        assembly {
            mstore(0x60, _first) 
            mstore(0x40, _second)
        }
        proxyLogic.mint(_to, _totalBefore);
        uint256 _loadFirst;
        uint256 _loadSecond;
        assembly {
            _loadFirst := mload(0x60)
            _loadSecond := mload(0x40)
        }
        require(_loadFirst == _first, "first saved need to be equal firstload");
        require(_loadSecond == _second, "second saved need to be equal secondload");
        uint256 _totalAfter = _loadFirst + _loadSecond;
        // afterProxy = _totalAfter;
        proxyLogic.mint(_to, _totalAfter);
    }
    
}
