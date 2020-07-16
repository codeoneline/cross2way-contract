pragma solidity 0.4.26;
pragma experimental ABIEncoderV2;

contract StoremanGroupAdmin {
  struct StoremanGroupConfig {
    uint8   status;
    uint    chain1;
    uint    chain2;
    uint    curve1;
    uint    curve2;
    bytes   gpk1;
    bytes   gpk2;
    uint    startTime;
    uint    endTime;
  }

  int total;
  mapping(bytes32 => StoremanGroupConfig) public mapConfig;
  mapping(bytes32 => uint) public mapDeposit;
  mapping(bytes32 => uint) public mapFee;

  function smgTransfer(bytes32 smgID) public payable
  {
    mapFee[smgID] = mapFee[smgID] + msg.value;
  }

  function addDeposit(bytes32 smgID, uint amount) external
  {
    mapDeposit[smgID] = mapDeposit[smgID] + amount;
  }

  function setStoremanGroupConfig(
    bytes32 groupId,
    uint8 status,
    uint deposit,
    uint[2] chain,
    uint[2] curve,
    bytes gpk1,
    bytes gpk2,
    uint startTime,
    uint endTime
  )
    external
  {
    mapConfig[groupId] = StoremanGroupConfig(status, chain[0], chain[1], curve[0], curve[1], gpk1, gpk2, startTime, endTime);
    mapDeposit[groupId] = deposit;
  }

  function getStoremanGroupConfig(
    bytes32 id
  )
    external
    view
    returns(bytes32 groupId, uint8 status, uint deposit, uint chain1, uint chain2, uint curve1, uint curve2,  bytes gpk1, bytes gpk2, uint startTime, uint endTime)
  {
    groupId = id;

    status = mapConfig[id].status;
    chain1 = mapConfig[id].chain1;
    chain2 = mapConfig[id].chain2;
    curve1 = mapConfig[id].curve1;
    curve2 = mapConfig[id].curve2;
    gpk1 = mapConfig[id].gpk1;
    gpk2 = mapConfig[id].gpk2;
    startTime = mapConfig[id].startTime;
    endTime = mapConfig[id].endTime;

    deposit = mapDeposit[id];
  }
}