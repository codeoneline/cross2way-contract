const OracleDelegate = artifacts.require('OracleDelegate');
const assert = require('assert');
const { sendAndGetReason } = require("./helper/helper");

contract('Oracle', (accounts) => {
  const [owner, admin, other] = accounts;
  let oracleDelegate = null;
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
    console.log(`oracleDelegate = ${oracleDelegate.address}`);
  })

  describe('normal', () => {
    it('good oracle example', async function() {
      console.log('oracle');
      await oracleDelegate.updatePrice([tokenSymbol], [v]);
      const value = web3.utils.toBN(await oracleDelegate.getValue(tokenSymbol)).toNumber();
      const values = (await oracleDelegate.getValues([tokenSymbol])).map(i => {return web3.utils.toBN(i).toNumber();});

      assert.equal(value, v);
      assert.equal(values[0], v);
    })
  });

  describe('updatePrice', () => {
    it('onlyOwner', async function() {
      const reason = await sendAndGetReason(oracleDelegate, "updatePrice", [[tokenSymbol], [v]], {from: other});
      assert.equal(reason, "Not owner");
    });

    it('keys.length == prices.length', async function() {
      let reason = await sendAndGetReason(oracleDelegate, "updatePrice", [[tokenSymbol], [v, v]], {from: owner});
      assert.equal(reason, "length not same");
      reason = await sendAndGetReason(oracleDelegate, "updatePrice", [[tokenSymbol, tokenSymbol2], [v]], {from: owner});
      assert.equal(reason, "length not same");
    });

    it.only('success', async function() {
      await oracleDelegate.updatePrice([tokenSymbol, tokenSymbol2], [v, v + 100]);
      const values = (await oracleDelegate.getValues([tokenSymbol, tokenSymbol2])).map(i => {return web3.utils.toBN(i).toNumber();});
      assert.equal(values[0], v);
      assert.equal(values[1], v + 100);

      await oracleDelegate.updatePrice([tokenSymbol], [v + 200]);
      const valueNew = web3.utils.toBN(await oracleDelegate.getValue(tokenSymbol)).toNumber();
      assert.equal(valueNew, v + 200);
    })
  })
})