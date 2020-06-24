pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

interface IOracle {
  function getDeposit(bytes32 smgID) public view returns (uint);
  function getValue(bytes key) public view returns (uint);
  function getValues(bytes[] keys) public view returns (uint[] values);
}