
pragma solidity ^0.4.24;

import "../components/BasicStorage.sol";

contract OracleStorage is BasicStorage {
  /**
    *
    * EVENTS
    *
    */
  event UpdatePrice(bytes32[] keys, uint[] prices);
  event UpdateDeposit(bytes32 smgID, uint amount);
  event AddWhitelist(address a);
  event RemoveWhitelist(address a);

  /************************************************************
    **
    ** VARIABLES
    **
    ************************************************************/
  mapping(bytes32 => uint) public mapPrices;
  mapping(bytes32 => uint) public mapStoremanGroup;
  mapping(address => bool) public mapWhitelist;
}