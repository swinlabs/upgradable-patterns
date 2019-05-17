pragma solidity ^0.4.24;

import "./SafeMath.sol";

/**
 * @title Proxy
 * @dev Gives the possibility to delegate any call to a foreign implementation.
 */
contract Proxy {
   using SafeMath for uint256;
   //signature of calldata (function - the 4 first bytes)
   // bytes4[] private functionSignatures;
   address[] private contractAddresses;
   // mapping(address => bytes4[]) functionSignatures;

   constructor() public {
      //update signatures
   }

   function pushContractAddress(address _address) public returns (bool result) {
      //functionSignature = keccak256(functionName(type1, type2, ..)) - first 4 bytes
      contractAddresses.push(_address);
      result = true;
   }

   function popContractAddress(address _address) public returns (bool result) {
      require(isExistingAddress == true, "removing address must exist");
      address memory _addresses;
      uint256 arrayLength;
      _addresses = contractAddresses();
      for (uint256 i = 0; i < _addresses.length; i++) {
            if (_address == _addresses[i]) {
                contractAddresses[i] = _addresses[arrayLength.sub(1)];
                delete contractAddresses[arrayLength.sub(1)];
                contractAddresses.length = arrayLength.sub(1);
                return true;
            }
        }

   } 

   function getContractAddresses() public view returns (address[] _addresses) {
      _addresses = contractAddresses
   }

   function isExistingAddress(address _address) public view returns (bool result) {
      address[] memory _addresses = getContractAddresses();
      for (uint i = 0; i < _addresses.length; i++) {
         if (_addresses[i] == _address) {
            result = true;
            break;
         }
      }
   }

   /**
   * @dev Fallback function allowing to perform a delegatecall to the given implementation.
   * This function will return whatever the implementation call returns
   */
   function () payable public {
      address _currentErc20Address = getErc20ContractdAddress();
      address _currentErc721Address = getErc721ContractAddress();

      require(_currentErc20Address != address(0));
      require(_currentErc721Address != address(0));

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
   