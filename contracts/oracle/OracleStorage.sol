
pragma solidity ^0.4.24;

import "../components/BasicStorage.sol";

contract OracleStorage is BasicStorage {
  /************************************************************
    **
    ** STRUCTURE DEFINATIONS
    **
    ************************************************************/
  struct StoremanGroupConfig {
    uint  deposit;
    uint  chain1;
    uint  chain2;
    uint  curve1;
    uint  curve2;
    bytes gpk1;
    bytes gpk2;
    uint  startTime;
    uint  endTime;
  }
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
  // symbol -> price
  mapping(bytes32 => uint) public mapPrices;
  // smgId -> amount
  mapping(bytes32 => uint) public mapStoremanGroup;
  // smgId -> StoremanGroupConfig
  mapping(bytes32 => StoremanGroupConfig) public mapStoremanGroupConfig

  mapping(address => bool) public mapWhitelist;
}