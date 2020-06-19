const OracleDelegate = artifacts.require('OracleDelegate');
const assert = require('assert');

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
  const asciiDecimals = 18;

  // convert to bytes
  const ancestorAccount = web3.utils.hexToBytes(asciiAncestorAccount);
  const ancestorName = web3.utils.hexToBytes(web3.utils.toHex(asciiAncestorName))
  const ancestorSymbol = web3.utils.hexToBytes(web3.utils.toHex(asciiAncestorSymbol))

  const fromAccount = web3.utils.hexToBytes(asciiFromAccount);

  const tokenName = web3.utils.hexToBytes(web3.utils.toHex(asciiTokenName));
  const tokenSymbol = web3.utils.hexToBytes(web3.utils.toHex(asciiTokenSymbol));

  before("init", async () => {
    oracleDelegate = await OracleDelegate.deployed();
    console.log(`oracleDelegate = ${oracleDelegate.address}`);
  })

  describe('normal', () => {
    it.only('good oracle example', async function() {
      console.log('oracle');
      const v = 100000;
      await oracleDelegate.updatePrice([tokenSymbol], [v]);
      const value = web3.utils.toBN(await oracleDelegate.getValue(tokenSymbol)).toNumber();
      const values = (await oracleDelegate.getValues([tokenSymbol])).map(i => {return web3.utils.toBN(i).toNumber();});

      assert.equal(value, v);
      assert.equal(values[0], v);
    })
  });
})