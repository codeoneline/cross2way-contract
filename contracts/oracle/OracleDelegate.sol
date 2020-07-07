pragma solidity ^0.4.24;

/**
 * Math operations with safety checks
 */

import "../components/Owned.sol";
import "./OracleStorage.sol";

contract OracleDelegate is OracleStorage, Owned {
  /**
    *
    * MODIFIERS
    *
    */
  modifier onlyWhitelist() {
        require(mapWhitelist[msg.sender], "Not in whitelist");
        _;
  }

  /// @notice update price
  /// @dev update price
  /// @param keys tokenPair keys
  /// @param prices token price
  function updatePrice(
    bytes32[] keys,
    uint[] prices
  )
    public
    onlyWhitelist
  {
    require(keys.length == prices.length, "length not same");

    for (uint256 i = 0; i < keys.length; i++) {
      mapPrices[keys[i]] = prices[i];
    }

    emit UpdatePrice(keys, prices);
  }

  function getValue(bytes32 key) public view returns (uint) {
    return mapPrices[key];
  }

  function getValues(bytes32[] keys) public view returns (uint[] values) {
    values = new uint[](keys.length);
    for(uint256 i = 0; i < keys.length; i++) {
        values[i] = mapPrices[keys[i]];
    }
  }

  function updateDeposit(
    bytes32 smgID,
    uint amount
  )
    public
    onlyWhitelist
  {
    mapStoremanGroup[smgID] = amount;

    emit UpdateDeposit(smgID, amount);
  }

  function getDeposit(bytes32 smgID) public view returns (uint) {
    return mapStoremanGroup[smgID];
  }

  function addWhitelist(
    address addr
  )
    public
    onlyOwner
  {
    mapWhitelist[addr] = true;

    emit AddWhitelist(addr);
  }

  function removeWhitelist(
    address addr
  )
    public
    onlyOwner
  {
    if (mapWhitelist[addr]) {
      delete mapWhitelist[addr];
    }
    emit RemoveWhitelist(addr);
  }

  function setStoremanGroupConfig(
    bytes32 id,
    uint deposit,
    uint chain1,
    uint chain2,
    uint curve1,
    uint curve2,
    bytes gpk1,
    bytes gpk2,
    uint startTime,
    uint endTime
  )
    external
    onlyOwner
  {
    mapStoremanGroupConfig[id].deposit = deposit;
    mapStoremanGroupConfig[id].chain1 = chain1;
    mapStoremanGroupConfig[id].chain2 = chain2;
    mapStoremanGroupConfig[id].curve1 = curve1;
    mapStoremanGroupConfig[id].curve2 = curve2;
    mapStoremanGroupConfig[id].gpk1 = gpk1;
    mapStoremanGroupConfig[id].gpk2 = gpk2;
    mapStoremanGroupConfig[id].startTime = startTime;
    mapStoremanGroupConfig[id].endTime = endTime;
  }

  function getStoremanGroupConfig(
    bytes32 id
  )
    external
    view
    returns(bytes32 groupId, uint deposit, uint chain1, uint chain2, uint curve1, uint curve2,  bytes gpk1, bytes gpk2, uint startTime, uint endTime)
  {
    groupId = id;
    deposit = mapStoremanGroupConfig[id].deposit;
    chain1 = mapStoremanGroupConfig[id].chain1;
    chain2 = mapStoremanGroupConfig[id].chain2;
    curve1 = mapStoremanGroupConfig[id].curve1;
    curve2 = mapStoremanGroupConfig[id].curve2;
    gpk1 = mapStoremanGroupConfig[id].gpk1;
    gpk2 = mapStoremanGroupConfig[id].gpk2;
    startTime = mapStoremanGroupConfig[id].startTime;
    endTime = mapStoremanGroupConfig[id].endTime;
  }
}