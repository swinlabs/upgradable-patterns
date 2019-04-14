pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract DataSatelite {
    using SafeMath for uint256;
    bytes32 public name = "ACG ACCOUNT DATABASE";
    uint8 public decimals = 2;

    uint256 internal acg20TotalSupply;
    address internal transferContractAddress;
    address internal mintContractAddress;
    address[] internal accounts;
    address public founder;
 
    mapping(address => uint256) internal acg20BalanceOf;   
    // mapping artist to artwork ID if needed
    // mapping bidder to contractAddress to Artwork ID = bidding value
    mapping (address => mapping (address => uint256)) internal acg20Allowed;
  
    // event SetACG721BalaceOf(address indexed to, uint256 artwork_id);
    event Acg20Allowance(address indexed from, address indexed spender, uint256 amount);


    /**
     * @dev Constructor. sets the original `owner` of the contract to the sender account.
     */
    constructor() public {
        founder = msg.sender;
        accounts.push(msg.sender);    //initiate the array with 1 account = founder;
    }

   	function setTransferContractAddress(address _transferContractAddress) onlyFounder public returns (bool) {
        transferContractAddress = _transferContractAddress;
    }

    function getTransferContractAddress() public view returns (address) {
        return transferContractAddress;
    }

    function setMintContractAddress(address _mintContractAddress) onlyFounder public returns (bool) {
        mintContractAddress = _mintContractAddress;
    }

    function getMintContractAddress() public view returns (address) {
        return mintContractAddress;
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

    modifier onlySateliteContracts() {
        require(msg.sender == getTransferContractAddress() || msg.sender == getMintContractAddress(), "Only Satelite Contracts are permitted for the operation");
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
  
    function addAcg20BalanceOf(address _account, uint256 _amount) public onlySateliteContracts returns (bool) {
        require(isExistingAccount(_account) == true, "account does not exist");
        acg20BalanceOf[_account] = acg20BalanceOf[_account].add(_amount);
        return true;
    }

    function subAcg20BalanceOf(address _account, uint256 _amount) public onlySateliteContracts returns (bool) {
        require(isExistingAccount(_account) == true, "account does not exist");
        require(getAcg20BalanceOf(_account) >= _amount);
        acg20BalanceOf[_account] = acg20BalanceOf[_account].sub(_amount);
        return true;
    }

    function getAcg20TotalSupply() public view returns (uint256) {
        return acg20TotalSupply;
    }

    function addAcg20TotalSupply(uint256 _value) public onlySateliteContracts returns (bool) {
        acg20TotalSupply = acg20TotalSupply.add(_value);
    }

    function subAcg20TotalSupply(uint256 _value) public onlySateliteContracts returns (bool) {
        acg20TotalSupply = acg20TotalSupply.sub(_value);
    }

    function getAcg20Allowance(address _from, address _spender) public view returns (uint256) {
        return acg20Allowed[_from][_spender];
    }
	
    function addAcg20Allowance(address _from, address _spender, uint256 _amount) public onlySateliteContracts returns (bool) {
        require(isExistingAccount(_from) == true, "account does not exist");
        require(isExistingAccount(_spender) == true, "account does not exist");
        acg20Allowed[_from][_spender] = acg20Allowed[_from][_spender].add(_amount);
        emit Acg20Allowance(_from, _spender, _amount);
        return true;
    }

    function subAcg20Allowance(address _from, address _spender, uint256 _value) public onlySateliteContracts returns (bool) {
        require(isExistingAccount(_from) == true, "account does not exist");
        require(isExistingAccount(_spender) == true, "account does not exist");
        uint256 _amount = getAcg20Allowance(_from, _spender);
        require(_amount >= _value);
        acg20Allowed[_from][_spender] = _amount.sub(_value);
        emit Acg20Allowance(_from, _spender, _amount);
    }
}
