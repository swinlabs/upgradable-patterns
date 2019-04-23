pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract Erc20Data {
    using SafeMath for uint256;
    bytes32 public name = "ERC20 ACCOUNT DATABASE";
    uint8 public decimals = 2;

    uint256 internal _totalSupply;
    address internal registerContractAddress;
    address internal erc20LogicContractAddress;
    address[] internal accounts;
    address internal _admin;
 
    mapping(address => uint256) internal _balanceOf;   
    // mapping artist to artwork ID if needed
    // mapping bidder to contractAddress to Artwork ID = bidding value
    mapping (address => mapping (address => uint256)) internal _allowed;
  
    // event SetACG721BalaceOf(address indexed to, uint256 artwork_id);
    event Erc20Allowance(address indexed from, address indexed spender, uint256 amount);


    /**
     * @dev Constructor. sets the original `owner` of the contract to the sender account.
     */
    constructor() public {
        _admin = msg.sender;
        accounts.push(msg.sender);    //initiate the array with 1 account = _admin;
    }

   	function setRegisterContractAddress(address _registerContractAddress) only_admin public returns (bool) {
        registerContractAddress = _registerContractAddress;
    }

    function getRegisterContractAddress() public view returns (address) {
        return registerContractAddress;
    }

    function set_erc20LogicContractAddress(address _erc20LogicContractAddress) only_admin public returns (bool) {
        erc20LogicContractAddress = _erc20LogicContractAddress;
    }

    function get_erc20LogicContractAddress() public view returns (address) {
        return erc20LogicContractAddress;
    }

    function addAccount(address newAccount) public returns (bool) {
        accounts.push(newAccount);
        return true;
    }

    function getAccounts() public view returns (address[]) {
        return accounts;
    }

    modifier only_admin() {
        require(msg.sender == _admin || msg.sender == getRegisterContractAddress(), "Only Admin or Register Contract is permitted for the operation");
        _;
    }

    modifier only_erc20_logicContract() {
        require(msg.sender == get_erc20LogicContractAddress(), "Only erc20 logic Contract is permitted for the operation");
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
    /**         erc20 functions */
    //////////////////////////////////////////////////////////////////////////////////////////

    function get_balanceOf(address _account) public view returns (uint256) {
        require(isExistingAccount(_account) == true, "account does not exist");
        return _balanceOf[_account];
    }
  
    function add_balanceOf(address _account, uint256 _amount) public only_erc20_logicContract returns (bool) {
        require(isExistingAccount(_account) == true, "account does not exist");
        _balanceOf[_account] = _balanceOf[_account].add(_amount);
        return true;
    }

    function sub_balanceOf(address _account, uint256 _amount) public only_erc20_logicContract returns (bool) {
        require(isExistingAccount(_account) == true, "account does not exist");
        require(get_balanceOf(_account) >= _amount);
        _balanceOf[_account] = _balanceOf[_account].sub(_amount);
        return true;
    }

    function get_totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function add_totalSupply(uint256 _value) public only_erc20_logicContract returns (bool) {
        _totalSupply = _totalSupply.add(_value);
    }

    function sub_totalSupply(uint256 _value) public only_erc20_logicContract returns (bool) {
        _totalSupply = _totalSupply.sub(_value);
    }

    function getErc20Allowance(address _from, address _spender) public view returns (uint256) {
        return _allowed[_from][_spender];
    }
	
    function addErc20Allowance(address _from, address _spender, uint256 _amount) public only_erc20_logicContract returns (bool) {
        require(isExistingAccount(_from) == true, "account does not exist");
        require(isExistingAccount(_spender) == true, "account does not exist");
        _allowed[_from][_spender] = _allowed[_from][_spender].add(_amount);
        emit Erc20Allowance(_from, _spender, _amount);
        return true;
    }

    function subErc20Allowance(address _from, address _spender, uint256 _value) public only_erc20_logicContract returns (bool) {
        require(isExistingAccount(_from) == true, "account does not exist");
        require(isExistingAccount(_spender) == true, "account does not exist");
        uint256 _amount = getErc20Allowance(_from, _spender);
        require(_amount >= _value);
        _allowed[_from][_spender] = _amount.sub(_value);
        emit Erc20Allowance(_from, _spender, _amount);
    }
}
