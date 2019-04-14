pragma solidity ^0.4.24;

import "./SafeMath.sol";
// import "./accounts.sol";

contract DataSateliteInterface {
    // Bring 8 proxy interface from Accounts contract into this contract
    // function addAccount(address newAccount) public returns (bool);
    // function getAccounts() public view returns (address[]);
    function isExistingAccount(address _account) public view returns (bool);
    function getAcg20BalanceOf(address _account) public view returns (uint256);
    function addAcg20BalanceOf(address _account, uint256 _amount) public returns (bool);
    function subAcg20BalanceOf(address _account, uint256 _amount) public returns (bool);
}


/**
 * @title ACG 20 Token
 * @dev inherited from standard ERC20 token, while provides specific functions to support artChainGlobal system
 * 
 */
contract SateliteTransfer {
    using SafeMath for uint256;
    string public name = "Satelite Transfer function";
    string public symbol = "SateliteTransfer";
    uint8 public decimals = 2;
    address public owner;
 
    DataSateliteInterface public dataContract;
    event Transfer(address indexed from, address indexed to, uint256 amount);
    // event Mint(address indexed to, uint256 amount);

    /**
     * @dev Constructor. sets the original `owner` of the contract to the sender account.
     */
    constructor() public {
        owner = msg.sender;
    }

    function setDataContractAddress(address _address) public returns (bool) {
        dataContract = DataSateliteInterface(_address);
    }

   	/**
	* @dev Throws if called by any account other than the contract owner.
	*/
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner is permitted for the operation");
        _;
    }


    /**THE FUNCTION USED BY NOMAL USER TO TRANSFER TOKEN ACG20 BACK AND FOR
	* @dev transfer token for a specified address
	* @param _to The address to transfer to.
	* @param _value The amount to be transferred.
	*/
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(dataContract.isExistingAccount(_to) == true, "account does not exist");
        require(dataContract.getAcg20BalanceOf(msg.sender) >= _value, "balance of sender must be larger than transferred amount");

        // SafeMath.sub will throw if there is not enough balance.
        dataContract.subAcg20BalanceOf(msg.sender, _value);
        dataContract.addAcg20BalanceOf(_to, _value);
        // emit dataContract.Acg20TransferEvent(msg.sender, _to, _value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }  
}
