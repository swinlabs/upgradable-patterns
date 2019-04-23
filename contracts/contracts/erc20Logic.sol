pragma solidity ^0.4.24;

import "./SafeMath.sol";
// import "./accounts.sol";

contract Erc20DataInterface {
    function isExistingAccount(address _account) public view returns (bool);
    function get_balanceOf(address _account) public view returns (uint256);  
    function add_balanceOf(address _account, uint256 _amount) public returns (bool);
    function sub_balanceOf(address _account, uint256 _amount) public returns (bool);
    function get_totalSupply() public view returns (uint256);
    function add_totalSupply(uint256 _value) public returns (bool);
    function sub_totalSupply(uint256 _value) public returns (bool);
    function getErc20Allowance(address _from, address _spender) public view returns (uint256);	
    function addErc20Allowance(address _from, address _spender, uint256 _amount) public returns (bool);
    function subErc20Allowance(address _from, address _spender, uint256 _value) public returns (bool);
}

contract RegisterInterface {
    function get_erc20DataContractAddr() public view returns (address);
}


/**
 * @title ACG 20 Token
 * @dev inherited from standard ERC20 token, while provides specific functions to support artChainGlobal system
 * 
 */
contract Erc20Logic {
    using SafeMath for uint256;
    string public name = "ArtChain Global Token 20";
    string public symbol = "ACG20";
    uint8 public decimals = 2;
    address public owner;
    address public _erc20DataAddress;
 
    Erc20DataInterface public erc20DataContract;
    RegisterInterface public registerContract;
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed to, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event TransferFrom(address indexed from, address indexed to, uint256 amount);
    event Approve(address indexed from, address indexed to, uint256 amount);

    /**
     * @dev Constructor. sets the original `owner` of the contract to the sender account.
     */
    constructor(address _registerContract) public {
        owner = msg.sender;
        registerContract = RegisterInterface(_registerContract);    //get instance of register contarct
        //then get erc20 data contract address and asign to this contract
        erc20DataContract = Erc20DataInterface(registerContract.get_erc20DataContractAddr());
    }

    function setAccountContractAddress(address _address) public returns (bool) {
        erc20DataContract = Erc20DataInterface(_address);
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
        require(erc20DataContract.isExistingAccount(_to) == true, "account does not exist");
        require(erc20DataContract.isExistingAccount(msg.sender) == true, "account does not exist");
        require(_value <= erc20DataContract.get_balanceOf(msg.sender), "Sender's balance must be larger than transferred amount");

        // SafeMath.sub will throw if there is not enough balance.
        erc20DataContract.sub_balanceOf(msg.sender, _value);
        erc20DataContract.add_balanceOf(_to, _value);
        // emit erc20DataContract.Acg20TransferEvent(msg.sender, _to, _value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

	/**
    * THE FUNCTION WILL BE USED FOR AUCTION PURPOSE ONLY.
    * IT CAN BE CALLED ONLY BY THE EXCHANGE CONTRACT
	* @dev Transfer tokens from one address to another
	* @param _from address The address which you want to send tokens from
	* @param _to address The address which you want to transfer to
	*/
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(erc20DataContract.isExistingAccount(_to) == true, "_to account does not exist");
        uint256 approval_value = erc20DataContract.getErc20Allowance(_from, msg.sender);
        require(approval_value >= _value);
        // transfer to _to account, then reduce the acg20Allowance        
        erc20DataContract.subErc20Allowance(_from, msg.sender, _value);
        erc20DataContract.add_balanceOf(_to, _value);
        emit TransferFrom(_from, _to, _value);
        return true;
    }
	
    /**
	* @dev Allows the user's balance as well as the total supply to be increated. Only contract owner is capable to call this method.
    * @param _to The address which you want to increase the balance
	* @param _amount the amount of tokens to be increased
	*/
    function mint(address _to, uint256 _amount) public returns(bool) {
        erc20DataContract.add_totalSupply(_amount);
        erc20DataContract.add_balanceOf(_to, _amount);
        emit Mint(_to, _amount);
        // emit Transfer(address(0), _to, _amount);
    }

    /**
	* @dev Destroy user's tokens with given amount, and decrease the total supply as well. Anyone can burn tokens from his own account. Throws if amount to be destroyed exceeds account's balance.
    *
	* @param _amount the amount of tokens to be destroyed
	*/
    function burn(uint256 _amount) public {
        require(erc20DataContract.isExistingAccount(msg.sender) == true, "account does not exist");
        require(erc20DataContract.get_balanceOf(msg.sender) >= _amount, "Burned amount exceeds user balance");
        // only sender == owner of the account;
        erc20DataContract.sub_totalSupply(_amount);
        erc20DataContract.sub_balanceOf(msg.sender, _amount);
        emit Burn(msg.sender, _amount);
    }
   
}
