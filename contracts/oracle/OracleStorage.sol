
pragma solidity ^0.4.24;

import "../components/BasicStorage.sol";

contract OracleStorage is BasicStorage {
  mapping(bytes32 => uint) public mapPrices;
  mapping(address => bool) public mapWhitelist;
}