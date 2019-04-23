pragma solidity ^0.4.24;

import './UpgradeabilityProxy.sol';

/**
 * @title OwnedUpgradeabilityProxy
 * @dev This contract combines an upgradeability proxy with basic authorization control functionalities
 */
contract OwnedUpgradeabilityProxy is UpgradeabilityProxy {
  /**
  * @dev Event to show ownership has been transferred
  * @param previousOwner representing the address of the previous owner
  * @param newOwner representing the address of the new owner
  */
  event ProxyOwnershipTransferred(address previousOwner, address newOwner);

  // Storage position of the owner of the contract
  bytes32 private constant proxyOwnerPosition = keccak256("art.chain.global.owner");

  /**
  * @dev the constructor sets the original owner of the contract to the sender account.
  */
  constructor(address _implementation) public {
    setProxyOwner(msg.sender);
    _upgradeTo(_implementation);
  }

  /**
   * @dev Tells the address of the owner
   * @return the address of the owner
   */
  function getProxyOwner() public view returns (address owner) {
    bytes32 position = proxyOwnerPosition;
    assembly {
      owner := sload(position)
    }
  }

  /**
   * @dev Allows the proxy owner to upgrade the current version of the proxy.
   * @param _implementation representing the address of the new implementation to be set.
   */
  function upgradeTo(address _implementation) public {
    _upgradeTo(_implementation);
  }

  /**
   * @dev Sets the address of the owner
   */
  function setProxyOwner(address _newProxyOwner) internal {
    bytes32 position = proxyOwnerPosition;
    assembly {
      sstore(position, _newProxyOwner)
    }
  }
}
