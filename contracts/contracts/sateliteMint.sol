pragma solidity ^0.4.24;

import "./SafeMath.sol";
// import "./accounts.sol";

contract DataSateliteInterface {
    // Bring 8 proxy interface from Accounts contract into this contract
    // function addAccount(address newAccount) public returns (bool);
    // function getAccounts() public view returns (address[]);
    function isExistingAccount(address _account) public view returns (bool);
    function addAcg20BalanceOf(address _account, uint256 _amount) public returns (bool);
    function addAcg20TotalSupply(uint256 _value) public returns (bool);
}


/**
 * @title ACG 20 Token
 * @dev inherited from standard ERC20 token, while provides specific functions to support artChainGlobal system
 * 
 */
contract SateliteMint {
    using SafeMath for uint256;
    string public name = "ArtChain Global Token 20";
    string public symbol = "ACG20";
    uint8 public decimals = 2;
    address public owner;
 
    DataSateliteInterface public dataContract;
    // event Transfer(address indexed from, address indexed to, uint256 amount);
    event Mint(address indexed to, uint256 amount);

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


    // /**THE FUNCTION USED BY NOMAL USER TO TRANSFER TOKEN ACG20 BACK AND FOR
	// * @dev transfer token for a specified address
	// * @param _to The address to transfer to.
	// * @param _value The amount to be transferred.
	// */
    // function transfer(address _to, uint256 _value) public returns (bool) {
    //     require(dataContract.isExistingAccount(_to) == true, "account does not exist");
    //     require(_value <= dataContract.getAcg20BalanceOf(msg.sender), "Sender's balance must be larger than transferred amount");

    //     // SafeMath.sub will throw if there is not enough balance.
    //     dataContract.subAcg20BalanceOf(msg.sender, _value);
    //     dataContract.addAcg20BalanceOf(_to, _value);
    //     // emit dataContract.Acg20TransferEvent(msg.sender, _to, _value);
    //     emit Transfer(msg.sender, _to, _value);
    //     return true;
    // }  

    /**
	* @dev Allows the user's balance as well as the total supply to be increated. Only contract owner is capable to call this method.
    * @param _to The address which you want to increase the balance
	* @param _amount the amount of tokens to be increased
	*/
    function mint(address _to, uint256 _amount) public returns(bool) {
        require(dataContract.isExistingAccount(_to) == true, "account does not exist");
        dataContract.addAcg20TotalSupply(_amount);
        dataContract.addAcg20BalanceOf(_to, _amount);
        emit Mint(_to, _amount);
    } 
}
