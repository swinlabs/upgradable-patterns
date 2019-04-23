pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract ProxyLogic {
    using SafeMath for uint256;
    bytes32 public name = "ACG ACCOUNT DATABASE";
    uint8 public decimals = 2;

    uint256 internal _totalSupply;
    address internal proxyContractAddress;
    address[] internal accounts;
    address public founder;
    bytes32 public _duringLogic;
    uint256 public testValue;
    uint256 public logicMemorySize;

 
    mapping(address => uint256) internal _balanceOf;   

    mapping (address => mapping (address => uint256)) internal _allowed;

    event _erc20TransferFrom(address indexed from, uint256 value);    
    event _erc20TransferTo(address indexed from, uint256 value);  
    event _erc20Allowance(address indexed from, address indexed to, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event TransferFrom(address indexed from, address indexed to, uint256 value);
  
    // event SetACG721BalaceOf(address indexed to, uint256 artwork_id);
    event Mint_erc20Of(address indexed to, uint256 amount);
    event Burn_erc20Of(address indexed from, uint256 amount);


    /**
     * @dev Constructor. sets the original `owner` of the contract to the sender account.
     */
    constructor() public {
        founder = msg.sender;
        accounts.push(msg.sender);    //initiate the array with 1 account = founder;
    }
    function get_duringLogic() public view returns (bytes32) {
        return _duringLogic;
    }

    function get_testValue() public view returns (uint256) {
        return testValue;
    }

    function get_logicMemorySize() public view returns (uint256) {
        return logicMemorySize;
    }

   	function setProxyContractAddress(address _proxyContractAddress) public onlyFounder returns (bool) {
        accounts.push(_proxyContractAddress);
        proxyContractAddress = _proxyContractAddress;
    }

    function getProxyContractAddress() public view returns (address) {
        return proxyContractAddress;
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

    // modifier onlyFounder() {
    //     require(msg.sender == getProxyContractAddress(), "Only proxy contract is permitted for the operation");
    //     _;
    // }

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
    /**         _erc20 functions */
    //////////////////////////////////////////////////////////////////////////////////////////

    function get_balanceOf(address _account) public view returns (uint256) {
        require(isExistingAccount(_account) == true, "account does not exist");
        return _balanceOf[_account];
    }
  
    function add_balanceOf(address _account, uint256 _amount) public returns (bool) {
        // require(isExistingAccount(_account) == true, "account does not exist");
        _balanceOf[_account] = _balanceOf[_account].add(_amount);
        emit _erc20TransferTo(_account, _amount);
        return true;
    }

    function sub_balanceOf(address _account, uint256 _amount) public returns (bool) {
        // require(isExistingAccount(_account) == true, "account does not exist");
        require(get_balanceOf(_account) >= _amount);
        _balanceOf[_account] = _balanceOf[_account].sub(_amount);
        emit _erc20TransferFrom(_account, _amount);
        return true;
    }

    function get_totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function add_totalSupply(uint256 _value) public returns (bool) {
       _totalSupply =_totalSupply.add(_value);
    }

    function sub_totalSupply(uint256 _value) public returns (bool) {
       _totalSupply =_totalSupply.sub(_value);
    }

    function get_allowance(address _from, address _spender) public view returns (uint256) {
        return _allowed[_from][_spender];
    }
	
    function add_allowance(address _from, address _spender, uint256 _amount) public returns (bool) {
        require(isExistingAccount(_from) == true, "account does not exist");
        require(isExistingAccount(_spender) == true, "account does not exist");
        _allowed[_from][_spender] = _allowed[_from][_spender].add(_amount);
        emit _erc20Allowance(_from, _spender, _amount);
        return true;
    }

    function sub_allowance(address _from, address _spender, uint256 _value) public returns (bool) {
        require(isExistingAccount(_from) == true, "account does not exist");
        require(isExistingAccount(_spender) == true, "account does not exist");
        uint256 _amount = get_allowance(_from, _spender);
        require(_amount >= _value);
        _allowed[_from][_spender] = _amount.sub(_value);
        emit _erc20Allowance(_from, _spender, _amount);
    }

    /**THE FUNCTION USED BY NOMAL USER TO TRANSFER TOKEN _erc20 BACK AND FOR
	* @dev transfer token for a specified address
	* @param _to The address to transfer to.
	* @param _value The amount to be transferred.
	*/
    function transfer(address _to, uint256 _value) public returns (bool) {
        // require(isExistingAccount(_to) == true, "account does not exist");
        // require(isExistingAccount(msg.sender) == true, "account does not exist");
        require(_value <= get_balanceOf(msg.sender), "Sender's balance must be larger than transferred amount");

        // SafeMath.sub will throw if there is not enough balance.
        sub_balanceOf(msg.sender, _value);
        add_balanceOf(_to, _value);
        // emit accountsContract._erc20TransferEvent(msg.sender, _to, _value);
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
        uint256 approval_value = get_allowance(_from, msg.sender);
        require(approval_value >= _value);
        // transfer to _to account, then reduce the _erc20Allowance        
        sub_allowance(_from, msg.sender, _value);
        add_balanceOf(_to, _value);
        emit TransferFrom(_from, _to,_value);
        return true;
    }

     /**
	* @dev Allows the user's balance as well as the total supply to be increated. Only contract owner is capable to call this method.
    * @param _to The address which you want to increase the balance
	* @param _amount the amount of tokens to be increased
	*/
    function mint(address _to, uint256 _amount) public returns(bool result) {
        bytes32 __duringLogic;
        assembly {
            mstore(0x60, 0x900)
            __duringLogic := mload(0x60)
            sstore(_duringLogic_slot, __duringLogic)
        }
        // _duringLogic = __duringLogic;
        add_totalSupply(_amount);
        add_balanceOf(_to, _amount);
        emit Mint_erc20Of(_to, _amount);
        // emit Transfer(address(0), _to, _amount);
        result = true;
    }

    // function mint(address _to, uint256 _amount) public returns(bool) {
    //     assembly {
    //         mload(0x60, _amount)
    //     }
    //     add_totalSupply(_amount);
    //     add_balanceOf(_to, _amount);
    //     emit Mint_erc20Of(_to, _amount);
    //     // emit Transfer(address(0), _to, _amount);
    // }

    /**
	* @dev Destroy user's tokens with given amount, and decrease the total supply as well. Anyone can burn tokens from his own account. Throws if amount to be destroyed exceeds account's balance.
    *
	* @param _amount the amount of tokens to be destroyed
	*/
    function burn(uint256 _amount) public {
        require(isExistingAccount(msg.sender) == true, "account does not exist");
        require(get_balanceOf(msg.sender) >= _amount, "Burned amount exceeds user balance");
        // only sender == owner of the account;
        sub_totalSupply(_amount);
        sub_balanceOf(msg.sender, _amount);
        emit Burn_erc20Of(msg.sender, _amount);
    }

    //a test for security
    function testAssembly(address _to, uint256 _amount) public returns (
    uint256 _first,
    uint256 _second,
    uint256 _third,
    uint256 _forth,
    uint256 _fifth,
    uint256 _sixth
    ) {
    // uint256 _testValue = 999;
    assembly {
        mstore(0x320, 999) 
        let _testValue := mload(0x320)
        sstore(testValue_slot, _testValue)
        sstore(logicMemorySize_slot, msize)
    }
    // testValue = _testValue;
    // proxyLogic.mint(_to, _amount);
    _first = _amount * 1;
    _second = _amount * 2;
    _third = _amount * 3;
    _forth = _amount * 4;
    _fifth = _amount * 5;
    _sixth = _amount * 6;
  }
    
}
