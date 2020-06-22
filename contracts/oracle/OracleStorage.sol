
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../components/BasicStorage.sol";

contract OracleStorage is BasicStorage {
  /**
    *
    * EVENTS
    *
    */
  event UpdatePrice(bytes[] keys, uint[] prices);

  /************************************************************
    **
    ** VARIABLES
    **
    ************************************************************/
  mapping(bytes32 => uint) public mapPrices;
  mapping(bytes32 => uint) public mapStoremanGroup;
  mapping(address => bool) public mapWhitelist;
}