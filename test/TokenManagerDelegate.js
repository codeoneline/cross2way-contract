const TokenManagerDelegate = artifacts.require('TokenManagerDelegate');
const MappingToken = artifacts.require('MappingToken');
const assert = require('assert');

async function sendAndGetReason(obj, funcName, args, options) {
  try {
    await obj[funcName](...args, options);
  } catch (e) {
    return e.reason;
  }
  return "";
}

contract('TokenManagerDelegate', (accounts) => {
  const [owner, admin, other] = accounts;
  let tokenManagerDelegate = null;
  console.log(`account = ${JSON.stringify(accounts)}`)

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

  const funcMemberParam = [
    1, [ancestorAccount, ancestorName, 
    ancestorSymbol, asciiAncestorDecimals, asciiAncestorChainID], 
    asciiFromChainID, asciiToChainID, fromAccount, 
    [tokenName, tokenSymbol, asciiDecimals]];

  before("init", async () => {
    // const a = await TokenManagerDelegate.deployed();
    // const n = await new TokenManagerDelegate();
    tokenManagerDelegate = await TokenManagerDelegate.deployed();
    console.log(`tokenManagerDelegate = ${tokenManagerDelegate.address}`);
  })

  describe('normal', () => {
    it.only('good complex example', async function() {
      let totalTokenPairs = parseInt(await tokenManagerDelegate.totalTokenPairs());
      funcMemberParam[0] = totalTokenPairs + 1;
      await tokenManagerDelegate.addTokenPair(...funcMemberParam, {from: owner});
      await tokenManagerDelegate.setFeeRatio(asciiFromChainID, asciiToChainID, 100, {from: owner});
      await tokenManagerDelegate.setFeeRatio(asciiToChainID, asciiFromChainID, 90, {from: owner});
      await tokenManagerDelegate.addAdmin(admin, {from: owner});
      await tokenManagerDelegate.mintToken(funcMemberParam[0], other, 100, {from: admin});

      totalTokenPairs = parseInt(await tokenManagerDelegate.totalTokenPairs());
      const tokenPairInfo = await tokenManagerDelegate.mapTokenPairInfo(totalTokenPairs);
      const token = await MappingToken.at(tokenPairInfo.toAccount);
      await token.transfer(admin, 80, {from: other});
      await tokenManagerDelegate.burnToken(funcMemberParam[0], 20, {from: admin});

      assert.equal(web3.utils.toBN(await token.balanceOf(admin)).toNumber(), 60);
      assert.equal(web3.utils.toBN(await token.balanceOf(other)).toNumber(), 20);
    });
  })

  describe('addTokenPair', () => {
    const funcName = 'addTokenPair';
    // onlyOwner
    it('onlyOwner', async function() {
      const reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", funcMemberParam, {from: admin});
      assert.equal(reason, "Not owner");
    });
    // onlyValidAccount(aInfo.ancestorAccount)
    // onlyValidAccount(fromAccount)
    it('account.length != 0', async function() {
      // onlyValidAccount(aInfo.ancestorAccount)
      const param = Object.assign(funcMemberParam);
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
      const param = Object.assign(funcMemberParam);
      param[0] = 2;
      let reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", param, {from: owner});
      assert.equal(reason, "id is 0");

      param[0] = 0;
      reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", param, {from: owner});
      assert.equal(reason, "id is 0");
    });
    // require(tokenInfo.name.length != 0, "name is null")
    it('tokenInfo.name.length != 0', async function() {
      const param = Object.assign(funcMemberParam);
      param[5][0] = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", param, {from: owner});
      assert.equal(reason, "name is null");
    });
    // require(tokenInfo.symbol.length != 0, "symbol is null")
    it('tokenInfo.symbol.length != 0', async function() {
      const param = Object.assign(funcMemberParam);
      param[5][1] = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "addTokenPair", param, {from: owner});
      assert.equal(reason, "symbol is null");
    });

    // it('mapTokenInfo has item 1', async function() {
    //   console.log(`address = ${tokenManagerDelegate.address}`)
    //   let tokenInfo = await tokenManagerDelegate.mapTokenInfo.call(1);

    //   assert.equal(tokenInfo.name, null);

    //   const tokenName = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenName));
    //   const tokenSymbol = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenSymbol));
    //   await tokenManagerDelegate.addToken(1, tokenName, tokenSymbol, decimals, {from: owner});
    //   tokenInfo = await tokenManagerDelegate.mapTokenInfo.call(1);

    //   assert.equal(tokenInfo.name, web3.utils.toHex(asciiTokenName));
    //   assert.equal(tokenInfo.symbol, web3.utils.toHex(asciiTokenSymbol));
    // });

    // it('token exists', async function() {
    //   const tokenName = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenName));
    //   const tokenSymbol = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenSymbol));
    //   const reason = await sendAndGetReason(tokenManagerDelegate, "addToken", [1, tokenName, tokenSymbol, decimals], {from: owner});
    //   assert.equal(reason, "Token exists");
    // });
  });

  describe('updateTokenPair', () => {
    it('info.ancestorAccount != ancestorAccount', async function() {
      const tokenName = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenName));
      const tokenSymbol = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenSymbol));
      await tokenManagerDelegate.addTokenPair(1, tokenName, tokenSymbol, decimals, {from: owner});
      tokenInfo = await tokenManagerDelegate.mapTokenInfo.call(1);
      console.log(`token = ${JSON.stringify(tokenInfo)}`);

      const tokenSymbolNew = await web3.utils.hexToBytes(await web3.utils.toHex('DAi'));
      // await tokenManagerDelegate.updateTokenPair()

    })
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
})