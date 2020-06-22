pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

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
    bytes[] keys,
    uint[] prices
  )
    public
    onlyWhitelist
  {
    require(keys.length == prices.length, "length not same");

    for (uint256 i = 0; i < keys.length; i++) {
      mapPrices[keccak256(keys[i])] = prices[i];
    }
  }

  function getValue(bytes key) public view returns (uint) {
    return mapPrices[keccak256(key)];
  }

  function getValues(bytes[] keys) public view returns (uint[] values) {
    values = new uint[](keys.length);
    for(uint256 i = 0; i < keys.length; i++) {
        values[i] = mapPrices[keccak256(keys[i])];
    }
  }

  function addWhitelist(
    address a
  )
    public
    onlyOwner
  {
    mapWhitelist[a] = true;
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
  }
}