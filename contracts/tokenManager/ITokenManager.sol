
pragma solidity ^0.4.24;

interface ITokenManager {
  function getTokenPairInfo(uint id) public view
    returns (uint fromChainID, bytes fromAccount, uint toChainID, address tokenAddress, bool isDelete);
  function getTokenInfo(uint id) public view
    returns (address addr, string name, string symbol, uint8 decimals);
  function getAncestorInfo(uint id) public view
    returns (bytes account, bytes name, bytes symbol, uint8 decimals, uint chainId);
  function getFeeRatio(uint fromChainID, uint toChainID) public view
    returns (uint);
}