pragma solidity 0.4.26;
pragma experimental ABIEncoderV2;

interface ITokenManager {
  function getTokenPairInfo(uint id) external view
    returns (uint fromChainID, bytes fromAccount, uint toChainID, bytes toAccount);
  function getTokenInfo(uint id) external view
    returns (address addr, string name, string symbol, uint8 decimals);
  function getAncestorInfo(uint id) external view
    returns (bytes account, bytes name, string symbol, uint8 decimals, uint chainId);
  function getTokenPairs() external view
    returns (uint[] id, uint[] fromChainID, bytes[] fromAccount, uint[] toChainID, bytes[] toAccount, string[] ancestorSymbol, uint8[] ancestorDecimals);
  function getTokenPairsByChainID(uint chainID1, uint chainID2) external view
    returns (uint[] id, uint[] fromChainID, bytes[] fromAccount, uint[] toChainID, bytes[] toAccount, string[] ancestorSymbol, uint8[] ancestorDecimals);

  function mintToken(uint id, address to, uint value) external;
  function burnToken(uint id, uint value) external;
}