pragma solidity ^0.4.24;

/**
 * @title Proxy
 * @dev Gives the possibility to delegate any call to a foreign implementation.
 */
contract Proxy {

  //some state to monitor memory at address 0x60
  bytes32 public _before;
  bytes32 public _during;
  uint256 public _after;
  uint256 public _callDataSize;
  bytes32 public _callDataLoad;   //just for one bytes
  bytes32 public _returnDataLoad;
  bytes32 public proxyMemorySize;
  // uint256 public _returnDataSize;

  //functions to get value
  function get_proxyMemorySize() public view returns (bytes32) {
    return proxyMemorySize;
  }

  function get_before() public view returns (bytes32) {
    return _before;
  }
  function get_during() public view returns (bytes32) {
    return _during;
  }

  function get_after() public view returns (uint256) {
    return _after;
  }

  function get_callDataLoad() public view returns (bytes32) {
    return _callDataLoad;
  }

  function get_callDataSize() public view returns (uint256) {
    return _callDataSize;
  }

  function get_returnDataLoad() public view returns (bytes32) {
    return _returnDataLoad;
  }

  // function get_returnDataSize() public view returns (uint256) {
  //   return _returnDataSize;
  // }

  /**
  * THE IMPLEMENT THIS IN ORDER TO AVOID UNDEFINDED WHEN FALLBACK FUNCTION CALL IT FROM PARRENT CONTRACT
  * @dev Tells the address of the implementation where every call will be delegated.
  * @return address of the implementation to which it will be delegated
  */
  function getContractdAddress() public view returns (address);

  /**
  * @dev Fallback function allowing to perform a delegatecall to the given implementation.
  * This function will return whatever the implementation call returns
  */
  function () payable public {
    address _currentAddress = getContractdAddress();
    require(_currentAddress != address(0));
    bytes32 __before; 
    bytes32 __during;
    bytes32 __after;
    bytes32 __returnDataOneByte;
    // uint256 __callDataSize;
    // bytes32 __callDataLoad;

    assembly {
      mstore(0x60,0x60) 
      // let ptr := mload(0x40)              //this is free memory, so mload(0x40) = 0x00
      //get value from address 0x60
      __before := mload(0x60)
    }
    _before = __before;
    assembly {
      //get data size
      // __callDataSize := calldatasize
      sstore(_callDataSize_slot, calldatasize)
      //ENHANCE THE USE OF MEMORY
      let ptr := add(msize, 20)   //copy to the next to the last item of memory, to assure no overide anything
      calldatacopy(ptr, 0, calldatasize)  //copy to memory: memory = [0x00:0x00+calldatasize=>msg.data[0:calldatasize]]
      // __callDataLoad := calldataload(0x0)
      //store data load
      sstore(_callDataLoad_slot, calldataload(0x0))
      let result := delegatecall(gas, _currentAddress, ptr, calldatasize, 0, 0)
      //get value in this address to see if we get it from mint call function
      __during := mload(0x60)
      sstore(_during_slot, __during)
      let size := returndatasize
      let ptr_return := add(msize, 20)   //copy to the next to the last item of memory, to assure no overide anything
      returndatacopy(ptr_return, 0, size)
      //store memory size
      sstore(proxyMemorySize_slot, msize)
      __returnDataOneByte := mload(ptr_return)
      sstore(_returnDataLoad_slot, __returnDataOneByte)
      //finally get the return data
      __after := mload(0x320)
      sstore(_after_slot, __after)
      // __callDataSize := mload(0x2000)
      switch result
      case 0 { revert(ptr_return, size) }
      default { return(ptr_return, size) }
    }
    // _after = __after;
    // _callDataSize = __callDataSize;
    // _callDataLoad = __callDataLoad;
  }
}
