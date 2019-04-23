pragma solidity ^0.4.24;

import "./SafeMath.sol";
// import "./accounts.sol";

contract Erc20DataInterface {
    function setRegisterContractAddress(address _registerContractAddress) public returns (bool);
    function getRegisterContractAddress() public view returns (address);
    function set_erc20LogicContractAddress(address _erc20LogicContractAddress) public returns (bool);
    function get_erc20LogicContractAddress() public view returns (address);
}

contract Erc20LogicInterface {

}


/**
 * @title ACG 20 Token
 * @dev inherited from standard ERC20 token, while provides specific functions to support artChainGlobal system
 * 
 */
contract Register {
    using SafeMath for uint256;
    string public name = "Register to hold new version of Contract";
    string public symbol = "Register";
    uint8 public decimals = 2;
    address public owner;
    address private erc20DataAddress;
    address private erc20LogicAddress;
    Erc20DataInterface private erc20DataContract;
    Erc20LogicInterface private erc20LogicContract;

    constructor () public {
        owner = msg.sender;        
    }

    function set_erc20DataContractAddr(address _erc20DataAddress) public returns (bool) {
        erc20DataAddress = _erc20DataAddress;
        erc20DataContract = Erc20DataInterface(erc20DataAddress);
    }

    function get_erc20DataContractAddr() public view returns (address) {
        return erc20DataAddress;
    }

    function set_erc20LoginContractAddr(address _newVersionAddress) public returns (bool) {
        erc20LogicAddress = _newVersionAddress;
        erc20LogicContract = Erc20LogicInterface(erc20LogicAddress);
        //set arc20Logic address to erc20Data contract
        erc20DataContract.set_erc20LogicContractAddress(erc20LogicAddress);
    }

    function get_erc20LoginContractAddr() public view returns (address) {
        return erc20LogicAddress;
    }
 
}
