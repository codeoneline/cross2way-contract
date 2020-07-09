const OracleDelegate = artifacts.require('OracleDelegate');
const assert = require('assert');
const { sendAndGetReason } = require("./helper/helper");
const from = require('../truffle').networks.development.from;

contract('Oracle', (accounts) => {
  const [owner_bk, white_bk, other] = accounts;
  const owner = from ? from : owner_bk;
  const white = white_bk.toLowerCase() === owner.toLowerCase() ? owner_bk : white_bk;
  let oracleDelegate = null;

  const asciiAncestorAccount = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const asciiAncestorName = "eth dai";
  const asciiAncestorSymbol = "DAI";
  const asciiAncestorDecimals = 18;
  const asciiAncestorChainID = 60;

  const asciiFromChainID = 60;
  const asciiToChainID = 5718350;
  const asciiFromAccount = "0x6b175474e89094c44da98b954eedeac495271d0f"

  const asciiTokenName = "eth dai";
  const asciiTokenSymbol = "DAI";
  const asciiTokenSymbol2 = "ETH";
  const asciiDecimals = 18;

  // convert to bytes
  const ancestorAccount = web3.utils.hexToBytes(asciiAncestorAccount);
  const ancestorName = web3.utils.hexToBytes(web3.utils.toHex(asciiAncestorName))
  const ancestorSymbol = web3.utils.hexToBytes(web3.utils.toHex(asciiAncestorSymbol))

  const fromAccount = web3.utils.hexToBytes(asciiFromAccount);

  const tokenName = web3.utils.hexToBytes(web3.utils.toHex(asciiTokenName));
  const tokenSymbol = web3.utils.hexToBytes(web3.utils.toHex(asciiTokenSymbol));
  const tokenSymbol2 = web3.utils.hexToBytes(web3.utils.toHex(asciiTokenSymbol2));
  const v = 100000;

  before("init", async () => {
    oracleDelegate = await OracleDelegate.deployed();
    await oracleDelegate.addWhitelist(white);
  })

  describe('normal', () => {
    it('good oracle example', async function() {
      await oracleDelegate.updatePrice([tokenSymbol], [v], { from: white });
      const value = web3.utils.toBN(await oracleDelegate.getValue(tokenSymbol)).toNumber();
      const values = (await oracleDelegate.getValues([tokenSymbol])).map(i => {return web3.utils.toBN(i).toNumber();});

      assert.equal(value, v);
      assert.equal(values[0], v);
    })
  });

  describe('updatePrice', () => {
    it('onlyWhitelist', async function() {
      const obj = await sendAndGetReason(oracleDelegate, "updatePrice", [[tokenSymbol], [v]], {from: other});
      assert.equal(obj.reason, "Not in whitelist");
    });

    it('keys.length == prices.length', async function() {
      let obj = await sendAndGetReason(oracleDelegate, "updatePrice", [[tokenSymbol], [v, v]], {from: white});
      assert.equal(obj.reason, "length not same");
      obj = await sendAndGetReason(oracleDelegate, "updatePrice", [[tokenSymbol, tokenSymbol2], [v]], {from: white});
      assert.equal(obj.reason, "length not same");
    });

    it('success', async function() {
      const receipt = await oracleDelegate.updatePrice([web3.utils.hexToBytes(web3.utils.toHex("BTC"))], [100], {from: white});
      const value = web3.utils.toBN(await oracleDelegate.getValue(web3.utils.hexToBytes(web3.utils.toHex("BTC")))).toNumber();
      assert.equal(value, 100);
    });
  })

  describe('getValue', () => {
    it('success', async function() {
      await oracleDelegate.updatePrice([tokenSymbol, tokenSymbol2], [v + 600, v + 700], {from: white});
      const value = web3.utils.toBN(await oracleDelegate.getValue(tokenSymbol)).toNumber();
      assert.equal(value, v + 600);
    })
  })

  describe('getValues', () => {
    it('success', async function() {
      await oracleDelegate.updatePrice([tokenSymbol, tokenSymbol2], [v + 800, v + 900], {from: white});
      const values = (await oracleDelegate.getValues([tokenSymbol, tokenSymbol2])).map(i => {return web3.utils.toBN(i).toNumber();});
      assert.equal(values[0], v + 800);
      assert.equal(values[1], v + 900);
    })
  })

  describe('addWhitelist', () => {
    it('onlyOwner', async function() {
      const obj = await sendAndGetReason(oracleDelegate, "addWhitelist", [other], {from: other});
      assert.equal(obj.reason, "Not owner");
    })
    it('success', async function() {
      await oracleDelegate.addWhitelist(other, {from: owner});
      await oracleDelegate.updatePrice([tokenSymbol], [v + 300], {from: other});
    });
  })

  describe('removeWhitelist', () => {
    it('onlyOwner', async function() {
      const obj = await sendAndGetReason(oracleDelegate.removeWhitelist, [other], {from: other});
      assert.equal(obj.reason, "Not owner");
    })
    it('if success, updatePrice will failed', async function() {
      await oracleDelegate.removeWhitelist(white, {from: owner});
      let obj = await sendAndGetReason(oracleDelegate.updatePrice, [[tokenSymbol], [v + 400]], {from: white});
      assert.equal(obj.reason, "Not in whitelist");
      await oracleDelegate.addWhitelist(white);
    });
  })

  describe('setStoremanGroupStatus', () => {
    it('onlyOwner', async function() {
      const obj = await sendAndGetReason(oracleDelegate.setStoremanGroupStatus, [tokenSymbol, 26], {from: other});
      assert.equal(obj.reason, "Not owner");
    })

    it('success', async function() {
      const obj = await sendAndGetReason(oracleDelegate.setStoremanGroupStatus, [tokenSymbol, 26], {from: owner});
      assert.equal(!obj.receipt, false);
      const r = await oracleDelegate.getStoremanGroupConfig(tokenSymbol);
      assert.equal(r.groupId, web3.utils.rightPad(web3.utils.toHex(asciiTokenSymbol), 64));
      assert.equal(r.status.toNumber(), 26);
    });
  })

  describe('setStoremanGroupConfig', () => {
    it('onlyOwner', async function() {
      const obj = await sendAndGetReason(oracleDelegate.setStoremanGroupConfig, [tokenSymbol,25,1,[11,12],[21,22],tokenSymbol,tokenSymbol2,4,5], {from: other});
      assert.equal(obj.reason, "Not owner");
    })

    it('and success', async function() {
      const obj = await sendAndGetReason(oracleDelegate.setStoremanGroupConfig, [tokenSymbol,25,1,[11,12],[21,22],tokenSymbol,tokenSymbol2,4,5], {from: owner});
      assert.equal(!obj.receipt, false);
      const r = await oracleDelegate.getStoremanGroupConfig(tokenSymbol);
      assert.equal(r.groupId, web3.utils.rightPad(web3.utils.toHex(asciiTokenSymbol), 64));
      assert.equal(r.status.toNumber(), 25);
      assert.equal(r.deposit.toNumber(), 1);
      assert.equal(r.chain1.toNumber(), 11);
      assert.equal(r.chain2.toNumber(), 12);
      assert.equal(r.curve1.toNumber(), 21);
      assert.equal(r.curve2.toNumber(), 22);
      assert.equal(r.gpk1, web3.utils.toHex(asciiTokenSymbol));
      assert.equal(r.gpk2, web3.utils.toHex(asciiTokenSymbol2));
      assert.equal(r.startTime.toNumber(), 4);
      assert.equal(r.endTime.toNumber(), 5);
    })
  })
})