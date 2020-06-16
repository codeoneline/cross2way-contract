const TokenManagerDelegate = artifacts.require('TokenManagerDelegate');
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
  const [owner, notOwner] = accounts;
  let tokenManagerDelegate = null;
  console.log(`account = ${JSON.stringify(accounts)}`)

  const asciiTokenName = "eth dai";
  const asciiTokenSymbol = "DAI";

  before("init", async () => {
    // const a = await TokenManagerDelegate.deployed();
    // const n = await new TokenManagerDelegate();
    tokenManagerDelegate = await TokenManagerDelegate.deployed();
    console.log(`tokenManagerDelegate = ${tokenManagerDelegate.address}`);
  })

  describe('addToken', () => {
    it('onlyOwner only called by owner', async () => {
      const tokenName = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenName));
      const tokenSymbol = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenSymbol));
      const reason = await sendAndGetReason(tokenManagerDelegate, "addToken", [1, tokenName, tokenSymbol, 18], {from: notOwner});
      assert.equal(reason, "Not owner");
    });

    it('name.length != 0', async () => {
      const tokenName = await web3.utils.hexToBytes("0x");
      const tokenSymbol = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenSymbol));
      const reason = await sendAndGetReason(tokenManagerDelegate, "addToken", [2, tokenName, tokenSymbol, 18], {from: owner});
      assert.equal(reason, "Name is null");
    });

    it('symbol.length != 0', async () => {
      const tokenName = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenName));
      const tokenSymbol = await web3.utils.hexToBytes("0x");
      const reason = await sendAndGetReason(tokenManagerDelegate, "addToken", [3, tokenName, tokenSymbol, 18], {from: owner});
      assert.equal(reason, "Symbol is null");
    });

    it.only('mapTokenInfo has item 1', async () => {
      let tokenInfo = await tokenManagerDelegate.mapTokenInfo.call(1);
      console.log(JSON.stringify(tokenInfo));

      assert.equal(tokenInfo.name, null);

      const tokenName = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenName));
      const tokenSymbol = await web3.utils.hexToBytes(await web3.utils.toHex(asciiTokenSymbol));
      await tokenManagerDelegate.addToken(1, tokenName, tokenSymbol, 18, {from: owner});
      tokenInfo = await tokenManagerDelegate.mapTokenInfo.call(1);
      console.log(JSON.stringify(tokenInfo));

      assert.equal(tokenInfo.name, web3.utils.toHex(asciiTokenName));
      assert.equal(tokenInfo.symbol, web3.utils.toHex(asciiTokenSymbol));
    });
  });
})