const TokenManagerDelegate = artifacts.require('TokenManagerDelegate');
const MappingToken = artifacts.require('MappingToken');
const assert = require('assert');
const { lastReceipt, sendAndGetReason } = require("./helper/helper");
const from = require('../truffle').networks.development.from;

contract('TokenManagerDelegate', (accounts) => {
  const [owner_bk, admin_bk, other] = accounts;
  const owner = from ? from : owner_bk;
  const admin = admin_bk.toLowerCase() === owner.toLowerCase() ? owner_bk : admin_bk;
  let tokenManagerDelegate = null;
  let token = null;
  console.log("TokenManagerDelegate");

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
  const asciiDecimals = 18;

  // convert to bytes
  const ancestorAccount = web3.utils.hexToBytes(asciiAncestorAccount);
  const ancestorName = web3.utils.hexToBytes(web3.utils.toHex(asciiAncestorName))
  const ancestorSymbol = web3.utils.hexToBytes(web3.utils.toHex(asciiAncestorSymbol))

  const fromAccount = web3.utils.hexToBytes(asciiFromAccount);

  const tokenName = web3.utils.hexToBytes(web3.utils.toHex(asciiTokenName));
  const tokenSymbol = web3.utils.hexToBytes(web3.utils.toHex(asciiTokenSymbol));

  const addTokenPairParam = [
    1, [ancestorAccount, ancestorName, 
    ancestorSymbol, asciiAncestorDecimals, asciiAncestorChainID], 
    asciiFromChainID, fromAccount, asciiToChainID, null];

  before("init", async () => {
    tokenManagerDelegate = await TokenManagerDelegate.deployed();
    console.log(`tokenManagerDelegate = ${tokenManagerDelegate.address}`);
    const receipt = await tokenManagerDelegate.addToken(tokenName, tokenSymbol, asciiDecimals, {from: owner});
    token = receipt.logs[1].args.tokenAddress;
    addTokenPairParam[5] = token;
    console.log(`tokenAddress = ${addTokenPairParam[5]}`);
  })

  describe('normal', () => {
    it('good token manager example', async function() {
      let totalTokenPairs = parseInt(await tokenManagerDelegate.totalTokenPairs());
      addTokenPairParam[0] = totalTokenPairs + 1;
      await tokenManagerDelegate.addTokenPair(...addTokenPairParam, {from: owner});
      await tokenManagerDelegate.setFeeRatio(asciiFromChainID, asciiToChainID, 100, {from: owner});
      await tokenManagerDelegate.setFeeRatio(asciiToChainID, asciiFromChainID, 90, {from: owner});
      await tokenManagerDelegate.addAdmin(admin, {from: owner});
      await tokenManagerDelegate.mintToken(addTokenPairParam[0], other, 100, {from: admin});

      totalTokenPairs = parseInt(await tokenManagerDelegate.totalTokenPairs());
      const tokenPairInfo = await tokenManagerDelegate.mapTokenPairInfo(totalTokenPairs);
      const token = await MappingToken.at(tokenPairInfo.tokenAddress);
      await token.transfer(admin, 80, {from: other});
      await tokenManagerDelegate.burnToken(addTokenPairParam[0], 20, {from: admin});

      assert.equal(web3.utils.toBN(await token.balanceOf(admin)).toNumber(), 60);
      assert.equal(web3.utils.toBN(await token.balanceOf(other)).toNumber(), 20);
    });
  })

  describe('fallback', () => {
    it('revert', async function() {
      // const reason = await sendAndGetReason(tokenManagerDelegate, "noFunc", []);
      try {
        const r = await web3.eth.sendTransaction({from: owner, to: tokenManagerDelegate.address});
        console.log("receipt =" + JSON.stringify(r));
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

  describe('addToken', () => {
    const addTokenParam = [tokenName, tokenSymbol, asciiDecimals];
    // onlyOwner
    it('onlyOwner', async function() {
      const reason = await sendAndGetReason(tokenManagerDelegate, "addToken", addTokenParam, {from: admin});
      assert.equal(reason, "Not owner");
    });
    // require(name.length != 0, "name is null")
    it('name.length != 0', async function() {
      const param = JSON.parse(JSON.stringify(addTokenParam));
      param[0] = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "addToken", param, {from: owner});
      assert.equal(reason, "name is null");
    });
    // require(symbol.length != 0, "symbol is null")
    it('symbol.length != 0', async function() {
      const param = JSON.parse(JSON.stringify(addTokenParam));
      param[1] = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "addToken", param, {from: owner});
      assert.equal(reason, "symbol is null");
    });

    it('success', async function() {
      const param = JSON.parse(JSON.stringify(addTokenParam));
      const reason = await sendAndGetReason(tokenManagerDelegate, "addToken", param, {from: owner});
      assert.equal(reason, "");
    });
  });

  describe('addTokenPair', () => {
    // onlyOwner
    it('onlyOwner', async function() {
      const reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", addTokenPairParam, {from: admin});
      assert.equal(reason, "Not owner");
    });
    it('account.length != 0', async function() {
      // onlyValidAccount(aInfo.ancestorAccount)
      const param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[1][0] = await web3.utils.hexToBytes("0x");
      let reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", param, {from: owner});
      assert.equal(reason, "Account is null");

      // onlyValidAccount(fromAccount)
      param[4] = await web3.utils.hexToBytes("0x");
      reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", param, {from: owner});
      assert.equal(reason, "Account is null");
    });
    // require(id == totalTokenPairs + 1, "id is 0")
    it('id == totalTokenPairs + 1', async function() {
      const param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[0] = parseInt(await tokenManagerDelegate.totalTokenPairs()) + 2;
      let reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", param, {from: owner});
      assert.equal(reason, "id is 0");

      param[0] = parseInt(await tokenManagerDelegate.totalTokenPairs());
      reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", param, {from: owner});
      assert.equal(reason, "id is 0");
    });

    // require(aInfo.ancestorName.length != 0, "ancestorName is null")
    it('aInfo.ancestorName.length != 0', async function() {
      const param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[0] = parseInt(await tokenManagerDelegate.totalTokenPairs()) + 1;
      param[1][1] = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", param, {from: owner});
      assert.equal(reason, "ancestorName is null");
    });
    // require(aInfo.ancestorSymbol.length != 0, "ancestorSymbol is null")
    it('aInfo.ancestorSymbol.length != 0', async function() {
      const param = JSON.parse(JSON.stringify(addTokenPairParam));
      param[0] = parseInt(await tokenManagerDelegate.totalTokenPairs()) + 1;
      param[1][2] = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", param, {from: owner});
      assert.equal(reason, "ancestorSymbol is null");
    });

    // success
    it('success', async function() {
      // const param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      // param[2] = await web3.utils.hexToBytes(web3.utils.toHex("WAN WDAI"));
      // const reason = await sendAndGetReason(tokenManagerDelegate, "updateAncestorInfo", param, {from: owner});
      // assert.equal(reason, "");

      // check log
    });
  });

  describe('updateAncestorInfo', () => {
    const updateAncestorInfoParam = [1, ancestorAccount, ancestorName, ancestorSymbol, asciiFromChainID];
    // onlyOwner
    it('onlyOwner', async function() {
      const param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      const reason = await sendAndGetReason(tokenManagerDelegate, "updateAncestorInfo", param, {from: admin});
      assert.equal(reason, "Not owner");
    });
    // onlyValidID(id)
    it('onlyValidID', async function() {
      const param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      param[0] = parseInt(await tokenManagerDelegate.totalTokenPairs()) + 1;
      const reason = await sendAndGetReason(tokenManagerDelegate, "updateAncestorInfo", param, {from: owner});
      assert.equal(reason, "id not exists");
    });
    // onlyValidAccount(ancestorAccount)
    it('onlyValidAccount', async function() {
      const param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      param[1] = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "updateAncestorInfo", param, {from: owner});
      assert.equal(reason, "Account is null");
    });
    // ancestorName.length != 0
    it('ancestorName.length != 0', async function() {
      const param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      param[2] = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "updateAncestorInfo", param, {from: owner});
      assert.equal(reason, "ancestorName is null");
    });
    // ancestorSymbol.length != 0
    it('ancestorSymbol.length != 0', async function() {
      const param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      param[3] = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "updateAncestorInfo", param, {from: owner});
      assert.equal(reason, "ancestorSymbol is null");
    });
    // success
    it('success', async function() {
      const param = JSON.parse(JSON.stringify(updateAncestorInfoParam));
      param[2] = await web3.utils.hexToBytes(web3.utils.toHex("WAN WDAI"));
      const reason = await sendAndGetReason(tokenManagerDelegate, "updateAncestorInfo", param, {from: owner});
      assert.equal(reason, "");

      // check log
    });
  })

  describe('updateTokenPair', () => {
    const updateTokenPairParam = [1, asciiFromChainID, fromAccount, asciiToChainID, null];
    beforeEach(function() {
      updateTokenPairParam[4] = token;
    });
    // onlyOwner
    it('onlyOwner', async function() {
      const param = JSON.parse(JSON.stringify(updateTokenPairParam));
      const reason = await sendAndGetReason(tokenManagerDelegate, "updateTokenPair", param, {from: admin});
      assert.equal(reason, "Not owner");
    });
    // onlyValidID(id)
    it('onlyValidID', async function() {
      const param = JSON.parse(JSON.stringify(updateTokenPairParam));
      param[0] = parseInt(await tokenManagerDelegate.totalTokenPairs()) + 1;
      const reason = await sendAndGetReason(tokenManagerDelegate, "updateTokenPair", param, {from: owner});
      assert.equal(reason, "id not exists");
    });
    // onlyValidAccount(ancestorAccount)
    it('onlyValidAccount', async function() {
      const param = JSON.parse(JSON.stringify(updateTokenPairParam));
      param[2] = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "updateTokenPair", param, {from: owner});
      assert.equal(reason, "Account is null");
    });
    it('success', async function() {
      const param = JSON.parse(JSON.stringify(updateTokenPairParam));
      param[1] = asciiFromChainID + 1;
      const reason = await sendAndGetReason(tokenManagerDelegate, "updateTokenPair", param, {from: owner});
      assert.equal(reason, "");

      // check log
    });
  })
})