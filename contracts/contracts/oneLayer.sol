pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract OneLayer {
    using SafeMath for uint256;
    bytes32 public name = "ACG ACCOUNT DATABASE";
    uint8 public decimals = 2;

    uint256 internal acg20TotalSupply;
    address internal acg20ContractAddress;
    address[] internal accounts;
    address public founder;
 
    mapping(address => uint256) internal acg20BalanceOf;   

    mapping (address => mapping (address => uint256)) internal acg20Allowed;

    event Acg20TransferFrom(address indexed from, uint256 value);    
    event Acg20TransferTo(address indexed from, uint256 value);  
    event Acg20Allowance(address indexed from, address indexed to, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event TransferFrom(address indexed from, address indexed to, uint256 value);
  
    // event SetACG721BalaceOf(address indexed to, uint256 artwork_id);
    event MintAcg20Of(address indexed to, uint256 amount);
    event BurnAcg20Of(address indexed from, uint256 amount);


    /**
     * @dev Constructor. sets the original `owner` of the contract to the sender account.
     */
    constructor() public {
        founder = msg.sender;
        accounts.push(msg.sender);    //initiate the array with 1 account = founder;
    }

   	function setAcg20ContractAddress(address _acg20ContractAddress) onlyFounder public returns (bool) {
        acg20ContractAddress = _acg20ContractAddress;
    }

    function getAcg20ContractAddress() public view returns (address) {
        return acg20ContractAddress;
    }

    function addAccount(address newAccount) public returns (bool) {
        accounts.push(newAccount);
        return true;
    }

    function getAccounts() public view returns (address[]) {
        return accounts;
    }

    modifier onlyFounder() {
        require(msg.sender == founder, "Only contract owner is permitted for the operation");
        _;
    }

    function isExistingAccount(address _account) public view returns (bool) {
        bool result = false;
        if (getAccounts().length == 0) {
            return false;
        }
        address[] memory accountsArray = getAccounts();
        uint accountLength = accountsArray.length;
        for (uint i = 0; i < accountLength; i++) {
            if (_account == accountsArray[i]) {
                return true;
            }
        }
        return result;
    }

    //////////////////////////////////////////////////////////////////////////////////////////
    /**         ACG20 functions */
    //////////////////////////////////////////////////////////////////////////////////////////

    function getAcg20BalanceOf(address _account) public view returns (uint256) {
        require(isExistingAccount(_account) == true, "account does not exist");
        return acg20BalanceOf[_account];
    }
  
    function addAcg20BalanceOf(address _account, uint256 _amount) public returns (bool) {
        require(isExistingAccount(_account) == true, "account does not exist");
        acg20BalanceOf[_account] = acg20BalanceOf[_account].add(_amount);
        emit Acg20TransferTo(_account, _amount);
        return true;
    }

    function subAcg20BalanceOf(address _account, uint256 _amount) public returns (bool) {
        require(isExistingAccount(_account) == true, "account does not exist");
        require(getAcg20BalanceOf(_account) >= _amount);
        acg20BalanceOf[_account] = acg20BalanceOf[_account].sub(_amount);
        emit Acg20TransferFrom(_account, _amount);
        return true;
    }

    function getAcg20TotalSupply() public view returns (uint256) {
        return acg20TotalSupply;
    }

    function addAcg20TotalSupply(uint256 _value) public returns (bool) {
        acg20TotalSupply = acg20TotalSupply.add(_value);
    }

    function subAcg20TotalSupply(uint256 _value) public returns (bool) {
        acg20TotalSupply = acg20TotalSupply.sub(_value);
    }

    function getAcg20Allowance(address _from, address _spender) public view returns (uint256) {
        return acg20Allowed[_from][_spender];
    }
	
    function addAcg20Allowance(address _from, address _spender, uint256 _amount) public returns (bool) {
        require(isExistingAccount(_from) == true, "account does not exist");
        require(isExistingAccount(_spender) == true, "account does not exist");
        acg20Allowed[_from][_spender] = acg20Allowed[_from][_spender].add(_amount);
        emit Acg20Allowance(_from, _spender, _amount);
        return true;
    }

    function subAcg20Allowance(address _from, address _spender, uint256 _value) public returns (bool) {
        require(isExistingAccount(_from) == true, "account does not exist");
        require(isExistingAccount(_spender) == true, "account does not exist");
        uint256 _amount = getAcg20Allowance(_from, _spender);
        require(_amount >= _value);
        acg20Allowed[_from][_spender] = _amount.sub(_value);
        emit Acg20Allowance(_from, _spender, _amount);
    }

    /**THE FUNCTION USED BY NOMAL USER TO TRANSFER TOKEN ACG20 BACK AND FOR
	* @dev transfer token for a specified address
	* @param _to The address to transfer to.
	* @param _value The amount to be transferred.
	*/
    function transferAcg20(address _to, uint256 _value) public returns (bool) {
        require(isExistingAccount(_to) == true, "account does not exist");
        require(isExistingAccount(msg.sender) == true, "account does not exist");
        require(_value <= getAcg20BalanceOf(msg.sender), "Sender's balance must be larger than transferred amount");

        // SafeMath.sub will throw if there is not enough balance.
        subAcg20BalanceOf(msg.sender, _value);
        addAcg20BalanceOf(_to, _value);
        // emit accountsContract.Acg20TransferEvent(msg.sender, _to, _value);
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
        require(isExistingAccount(_to) == true, "_to account does not exist");
        uint256 approval_value = getAcg20Allowance(_from, msg.sender);
        require(approval_value >= _value);
        // transfer to _to account, then reduce the acg20Allowance        
        subAcg20Allowance(_from, msg.sender, _value);
        addAcg20BalanceOf(_to, _value);
        emit TransferFrom(_from, _to,_value);
        return true;
    }

     /**
	* @dev Allows the user's balance as well as the total supply to be increated. Only contract owner is capable to call this method.
    * @param _to The address which you want to increase the balance
	* @param _amount the amount of tokens to be increased
	*/
    function mint(address _to, uint256 _amount) public onlyFounder returns(bool) {
        addAcg20TotalSupply(_amount);
        addAcg20BalanceOf(_to, _amount);
        emit MintAcg20Of(_to, _amount);
        // emit Transfer(address(0), _to, _amount);
    }

    /**
	* @dev Destroy user's tokens with given amount, and decrease the total supply as well. Anyone can burn tokens from his own account. Throws if amount to be destroyed exceeds account's balance.
    *
	* @param _amount the amount of tokens to be destroyed
	*/
    function burn(uint256 _amount) public {
        require(isExistingAccount(msg.sender) == true, "account does not exist");
        require(getAcg20BalanceOf(msg.sender) >= _amount, "Burned amount exceeds user balance");
        // only sender == owner of the account;
        subAcg20TotalSupply(_amount);
        subAcg20BalanceOf(msg.sender, _amount);
        emit BurnAcg20Of(msg.sender, _amount);
    }
    
}
