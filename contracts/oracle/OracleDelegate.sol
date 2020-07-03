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

  function getValue(bytes32 key) public view returns (uint) {
    return mapPrices[key];
  }

  function getValues(bytes32[] keys) public view returns (uint[] values) {
    values = new uint[](keys.length);
    for(uint256 i = 0; i < keys.length; i++) {
        values[i] = mapPrices[keys[i]];
    }
  }

  function addWhitelist(
    address a
  )
    public
    onlyOwner
  {
    mapWhitelist[a] = true;

    emit AddWhitelist(a);
  }

  function removeWhitelist(
    address a
  )
    public
    onlyOwner
  {
    if (mapWhitelist[a]) {
      delete mapWhitelist[a];
    }
    emit RemoveWhitelist(a);
  }
}