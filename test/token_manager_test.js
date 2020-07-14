const TokenManagerProxy = artifacts.require('TokenManagerProxy');
const TokenManagerDelegate = artifacts.require('TokenManagerDelegate');
const MappingToken = artifacts.require('MappingToken');

const assert = require('assert');
const { sendAndGetReason } = require('./helper.js');
const from = require('../truffle').networks.development.from;

const newTokenManager = async (accounts) => {
  const tokenManagerProxy = await TokenManagerProxy.new();
  const tokenManagerDelegate = await TokenManagerDelegate.new();
  await tokenManagerProxy.upgradeTo(tokenManagerDelegate.address);

  console.log(`tokenManagerDelegate = ${tokenManagerDelegate.address}`);
  return {tokenManagerProxy: tokenManagerProxy, tokenManagerDelegate: tokenManagerDelegate}
}

const getDeployedTokenManager = async (accounts) => {
  await deployer.deploy(TokenManagerProxy);
  const tokenManagerProxy = await TokenManagerProxy.deployed();

  await deployer.deploy(TokenManagerDelegate);
  const tokenManagerDelegate = await TokenManagerDelegate.deployed();

  await tokenManagerProxy.upgradeTo(tokenManagerDelegate.address);

  return {tokenManagerProxy: tokenManagerProxy, tokenManagerDelegate: tokenManagerDelegate}
}

contract('TokenManagerDelegate', (accounts) => {
  const [owner_bk, admin_bk, other] = accounts;
  const owner = from ? from : owner_bk;
  const admin = admin_bk.toLowerCase() === owner.toLowerCase() ? owner_bk : admin_bk;

  const aAccount = web3.utils.hexToBytes("0x6b175474e89094c44da98b954eedeac495271d0f");
  const aName = "eth dai";
  const aSymbol = "DAI";
  const aDecimals = 18;
  const aChainID = 60;

  const fromChainID = 60;
  const toChainID = 5718350;
  const decimals = 18;
  const fromAccount = web3.utils.hexToBytes('0x6b175474e89094c44da98b954eedeac495271d0f');

  const nameDAI = 'ETH DAI';
  const symbolDAI = 'DAI';
  const nameDAI_NEW = 'NEW ETH DAI';
  const symbolDAI_NEW = 'NEW DAI';
  const nameETH = 'ETH ETH';
  const symbolETH = 'ETH';
  const nameBTC = 'BTC BTC';
  const symbolBTC = 'BTC';

  const addTokenPairParam = [
    1, [aAccount, aName, aSymbol, aDecimals, aChainID], 
      fromChainID, fromAccount, toChainID, null];

  before("init", async () => {});

  describe('normal', () => {
    it('good token manager example', async function() {
      const { tokenManagerDelegate } = await newTokenManager(accounts);

      let receipt = await tokenManagerDelegate.addToken(nameDAI, symbolDAI, decimals, {from: owner});
      // check AddToken event log
      const addTokenEvent = receipt.logs[0].args;
      assert.ok(addTokenEvent.tokenAddress != "0x0000000000000000000000000000000000000000");
      assert.equal(nameDAI, addTokenEvent.name);
      assert.equal(symbolDAI, addTokenEvent.symbol);
      assert.equal(decimals, addTokenEvent.decimals.toNumber());

      let param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[0] = 11;
      param[2] = 61;
      param[4] = 5718351;
      param[5] = receipt.logs[0].args.tokenAddress;
      receipt = await tokenManagerDelegate.addTokenPair(...param, {from: owner})
      // check AddTokenPair event log
      const addTokenPairEvent = receipt.logs[0].args;
      assert.equal(param[0], addTokenPairEvent.id.toNumber());
      assert.equal(param[2], addTokenPairEvent.fromChainID.toNumber());
      assert.equal(web3.utils.padRight(web3.utils.bytesToHex(param[3]), 64), addTokenPairEvent.fromAccount);
      assert.equal(param[4], addTokenPairEvent.toChainID.toNumber());
      assert.equal(param[5].toLowerCase(), addTokenPairEvent.tokenAddress.toLowerCase());

      receipt = await tokenManagerDelegate.addToken(nameETH, symbolETH, decimals, {from: owner});
      param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[0] = 12;
      param[2] = 61;
      param[4] = 5718351;
      param[5] = receipt.logs[0].args.tokenAddress;
      await tokenManagerDelegate.addTokenPair(...param, {from: owner});

      receipt = await tokenManagerDelegate.addToken(nameBTC, symbolBTC, decimals, {from: owner});
      param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[0] = 13;
      param[2] = 63;
      param[4] = 5718353;
      param[5] = receipt.logs[0].args.tokenAddress;
      await tokenManagerDelegate.addTokenPair(...param, {from: owner});

      receipt = await tokenManagerDelegate.addAdmin(admin, {from: owner});
      // check AddAdmin event log
      assert.equal(admin.toLowerCase(), receipt.logs[0].args.admin.toLowerCase());

      const tokenPairID = parseInt(await tokenManagerDelegate.mapTokenPairIndex(1));
      const tokenPairInfo = await tokenManagerDelegate.mapTokenPairInfo(tokenPairID);
      const token = await MappingToken.at(tokenPairInfo.tokenAddress);
      receipt = await tokenManagerDelegate.mintToken(tokenPairID, other, 100, {from: admin});
      // check MintToken event log
      const mintTokenEvent = receipt.logs[0].args;
      assert.equal(tokenPairID, mintTokenEvent.id.toNumber());
      assert.equal(other.toLowerCase(), mintTokenEvent.to.toLowerCase());
      assert.equal(100, mintTokenEvent.value.toNumber());

      await token.transfer(admin, 80, {from: other});

      receipt = await tokenManagerDelegate.burnToken(tokenPairID, 20, {from: admin});
      // check BurnToken event log
      const burnTokenEvent = receipt.logs[0].args;
      assert.equal(tokenPairID, burnTokenEvent.id.toNumber());
      assert.equal(20, burnTokenEvent.value.toNumber());

      assert.equal(web3.utils.toBN(await token.balanceOf(admin)).toNumber(), 60);
      assert.equal(web3.utils.toBN(await token.balanceOf(other)).toNumber(), 20);

      const tokenPairInfo_get = await tokenManagerDelegate.getTokenPairInfo(tokenPairID);
      assert.equal(tokenPairInfo_get.fromChainID.toNumber(), tokenPairInfo.fromChainID.toNumber());
      
      let tokenInfo = await tokenManagerDelegate.getTokenInfo(tokenPairID);
      assert.equal(tokenInfo.name, nameDAI);
      assert.equal(tokenInfo.symbol, symbolDAI);

      receipt = await tokenManagerDelegate.updateToken(tokenPairID, nameDAI_NEW, symbolDAI_NEW);
      // check UpdateToken event log
      const updateTokenEvent = receipt.logs[0].args;
      assert.equal(tokenPairID, updateTokenEvent.id.toNumber());
      assert.equal(nameDAI_NEW, updateTokenEvent.name);
      assert.equal(symbolDAI_NEW, updateTokenEvent.symbol);

      tokenInfo = await tokenManagerDelegate.getTokenInfo(tokenPairID);
      assert.equal(tokenInfo.name, nameDAI_NEW);
      assert.equal(tokenInfo.symbol, symbolDAI_NEW);
      
      const ancestorInfo = await tokenManagerDelegate.getAncestorInfo(tokenPairID);
      const padAccount = web3.utils.padRight("0x6b175474e89094c44da98b954eedeac495271d0f", 64);
      assert.equal(ancestorInfo.account, padAccount);
      assert.equal(ancestorInfo.name, aName);
      assert.equal(ancestorInfo.symbol, aSymbol);
      assert.equal(ancestorInfo.decimals.toNumber(), aDecimals);
      assert.equal(ancestorInfo.chainId.toNumber(), aChainID);

      receipt = await tokenManagerDelegate.updateAncestorInfo(tokenPairID, aAccount, "new name", aSymbol, aChainID);
      // check UpdateAncestorInfo event log
      const updateAncestorInfoEvent = receipt.logs[0].args;
      assert.equal(tokenPairID, updateAncestorInfoEvent.id.toNumber());
      assert.equal(web3.utils.padRight(web3.utils.bytesToHex(aAccount), 64), updateAncestorInfoEvent.ancestorAccount);
      assert.equal("new name", updateAncestorInfoEvent.ancestorName);
      assert.equal(aSymbol, updateAncestorInfoEvent.ancestorSymbol);
      assert.equal(aChainID, updateAncestorInfoEvent.ancestorChainID.toNumber());

      const ancestorInfo2 = await tokenManagerDelegate.getAncestorInfo(tokenPairID);
      assert.equal(ancestorInfo2.name, "new name");

      const tokenPairs = await tokenManagerDelegate.getTokenPairs();
      assert.equal(tokenPairs.id[0].toNumber(), 11);
      assert.equal(tokenPairs.id[1].toNumber(), 12);
      assert.equal(tokenPairs.id[2].toNumber(), 13);
      assert.equal(tokenPairs.id.length, 3);

      const tokenPairs2 = await tokenManagerDelegate.getTokenPairsByChainID(fromChainID + 1, toChainID + 1);
      assert.equal(tokenPairs2.id[0].toNumber(), 11);
      assert.equal(tokenPairs2.id[1].toNumber(), 12);
      assert.equal(tokenPairs2.id.length, 2);

      receipt = await tokenManagerDelegate.removeTokenPair(11);
      // check RemoveTokenPair event log
      assert.equal(receipt.logs[0].args.id.toNumber(), 11);

      const tokenPairs3 = await tokenManagerDelegate.getTokenPairsByChainID(fromChainID + 1, toChainID + 1);
      assert.equal(tokenPairs3.id[0].toNumber(), 12);
      assert.equal(tokenPairs3.id.length, 1);

      receipt = await tokenManagerDelegate.updateTokenPair(13, toChainID + 1, fromAccount, fromChainID + 1, token.address);
      // check UpdateTokenPair event log
      const updateTokenPairEvent = receipt.logs[0].args;
      assert.equal(updateTokenPairEvent.id.toNumber(), 13);
      assert.equal(updateTokenPairEvent.fromChainID.toNumber(), toChainID + 1);
      assert.equal(updateTokenPairEvent.fromAccount, web3.utils.padRight(web3.utils.bytesToHex(fromAccount), 64));
      assert.equal(updateTokenPairEvent.toChainID.toNumber(), fromChainID + 1);
      assert.equal(addTokenPairEvent.tokenAddress.toLowerCase(), token.address.toLowerCase());

      const tokenPairs4 = await tokenManagerDelegate.getTokenPairsByChainID(fromChainID + 1, toChainID + 1);
      assert.equal(tokenPairs4.id[0].toNumber(), 12);
      assert.equal(tokenPairs4.id[1].toNumber(), 13);
      assert.equal(tokenPairs4.id.length, 2);

      const obj = await tokenManagerDelegate.removeAdmin(admin, {from: owner});
      assert.equal(obj.receipt.status, true);
      // check RemoveAdmin event log
      const removeAdminEvent = obj.logs[0].args;
      assert.equal(admin.toLowerCase(), removeAdminEvent.admin.toLowerCase());
    });
  });

  describe('addToken', () => {
    it('onlyOwner, name.length != 0, symbol.length != 0', async function() {
      const { tokenManagerDelegate } = await newTokenManager(accounts);

      const addTokenParam = [nameBTC, symbolBTC, decimals];
      let obj = await sendAndGetReason(tokenManagerDelegate.addToken, addTokenParam, {from: admin});
      assert.equal(obj.reason, "Not owner");

      let param = JSON.parse(JSON.stringify(addTokenParam));
      param[0] = "";
      obj = await sendAndGetReason(tokenManagerDelegate.addToken, param, {from: owner});
      assert.equal(obj.reason, "name is null");

      param = JSON.parse(JSON.stringify(addTokenParam));
      param[1] = "";
      obj = await sendAndGetReason(tokenManagerDelegate.addToken, param, {from: owner});
      assert.equal(obj.reason, "symbol is null");
    });
  });

  describe('addTokenPair', () => {
    it('ancestorName, ancestorSymbol length', async function() {
      const { tokenManagerDelegate } = await newTokenManager(accounts);
      let param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[1][1] = "";
      param[5] = "0x6b175474e89094c44da98b954eedeac495271d0f";
      let obj = await sendAndGetReason(tokenManagerDelegate.addTokenPair, param, {from: owner});
      assert.equal(obj.reason, "ancestorName is null");

      param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[1][2] = "";
      param[5] = "0x6b175474e89094c44da98b954eedeac495271d0f";
      obj = await sendAndGetReason(tokenManagerDelegate.addTokenPair, param, {from: owner});
      assert.equal(obj.reason, "ancestorSymbol is null");
    });
  })

  describe('fallback', () => {
    it('revert', async function() {
      try {
        const { tokenManagerDelegate } = await newTokenManager(accounts);
        const r = await web3.eth.sendTransaction({from: owner, to: tokenManagerDelegate.address});
      } catch (e) {
        const isHave = e.message.includes("revert Not support");
        if (isHave) {
          assert.ok("fallback is right");
          return;
        }
      }
      assert.fail("fallback error");
    });
  });

  describe('updateAncestorInfo', () => {
    it('onlyOwner, onlyValidID, requires', async function() {
      const { tokenManagerDelegate } = await newTokenManager(accounts);

      const updateAncestorInfoParam = [addTokenPairParam[0], aAccount, aName, aSymbol, aChainID];

      let obj = await sendAndGetReason(tokenManagerDelegate.updateAncestorInfo, updateAncestorInfoParam, {from: admin});
      assert.equal(obj.reason, "Not owner");

      let param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      obj = await sendAndGetReason(tokenManagerDelegate.updateAncestorInfo, param, {from: owner});
      assert.equal(obj.reason, "token deleted");

      let receipt = await tokenManagerDelegate.addToken(nameDAI, symbolDAI, decimals, {from: owner});
      param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[5] = receipt.logs[0].args.tokenAddress;
      await tokenManagerDelegate.addTokenPair(...param, {from: owner});

      param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      param[2] = "";
      obj = await sendAndGetReason(tokenManagerDelegate.updateAncestorInfo, param, {from: owner});
      assert.equal(obj.reason, "ancestorName is null");

      param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      param[3] = "";
      obj = await sendAndGetReason(tokenManagerDelegate.updateAncestorInfo, param, {from: owner});
      assert.equal(obj.reason, "ancestorSymbol is null");

      await tokenManagerDelegate.removeTokenPair(addTokenPairParam[0]);

      param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      obj = await sendAndGetReason(tokenManagerDelegate.updateAncestorInfo, param, {from: owner});
      assert.equal(obj.reason, "token deleted");
    });
  });

  describe('mintToken', () => {
    it('onlyAdmin', async function() {
      const { tokenManagerDelegate } = await newTokenManager(accounts);

      let receipt = await tokenManagerDelegate.addToken(nameDAI, symbolDAI, decimals, {from: owner});
      param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[5] = receipt.logs[0].args.tokenAddress;
      await tokenManagerDelegate.addTokenPair(...param, {from: owner});

      await tokenManagerDelegate.addAdmin(admin, {from: owner});

      obj = await sendAndGetReason(tokenManagerDelegate.mintToken, [addTokenPairParam[0], other, 100], {from: owner});
      assert.equal(obj.reason, "not admin");

      obj = await sendAndGetReason(tokenManagerDelegate.mintToken, [addTokenPairParam[0], other, 0], {from: admin});
      assert.equal(obj.reason, "Value is null");
    });
  });

  describe('upgradeTo', () => {
    it('onlyOwner, require', async function() {
      const { tokenManagerDelegate, tokenManagerProxy } = await newTokenManager(accounts);
      const param = ["0x6b175474e89094c44da98b954eedeac495271d0f"];
      let obj = await sendAndGetReason(tokenManagerProxy.upgradeTo, param, {from: admin});
      assert.equal(obj.reason, "Not owner");

      param[0] = "0x0000000000000000000000000000000000000000";
      obj = await sendAndGetReason(tokenManagerProxy.upgradeTo, param, {from: owner});
      assert.equal(obj.reason, "Cannot upgrade to invalid address");

      param[0] = tokenManagerDelegate.address;
      obj = await sendAndGetReason(tokenManagerProxy.upgradeTo, param, {from: owner});
      assert.equal(obj.reason, "Cannot upgrade to the same implementation");
    })
  })
})