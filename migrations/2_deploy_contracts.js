const TokenManagerProxy = artifacts.require('TokenManagerProxy');
const TokenManagerDelegate = artifacts.require('TokenManagerDelegate');
const OracleProxy = artifacts.require('OracleProxy');
const OracleDelegate = artifacts.require('OracleDelegate');

module.exports = async (deployer, network, accounts) => {
  const [owner, admin, other] = accounts;
  // deploy token manager proxy
  await deployer.deploy(TokenManagerProxy);
  const proxy = await TokenManagerProxy.deployed();
  // deploy token manager delegate
  await deployer.deploy(TokenManagerDelegate);
  const delegate = await TokenManagerDelegate.deployed();
  // token manager proxy upgrade to token manager delegate
  await proxy.upgradeTo(delegate.address);

  // deploy oracle proxy
  await deployer.deploy(OracleProxy);
  const oracleProxy = await OracleProxy.deployed();
  // deploy oracle delegate
  await deployer.deploy(OracleDelegate);
  const oracleDelegate = await OracleDelegate.deployed();
  // oracle proxy upgrade to oracle delegate
  await oracleProxy.upgradeTo(oracleDelegate.address);

  // add token
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
  const v = 100000;

  // const funcMemberParam = [
  //   1, [ancestorAccount, ancestorName, 
  //   ancestorSymbol, asciiAncestorDecimals, asciiAncestorChainID], 
  //   asciiFromChainID, asciiToChainID, fromAccount, 
  //   [tokenName, tokenSymbol, asciiDecimals]];

  // await delegate.addTokenPair(...funcMemberParam, {from: owner});
  // await delegate.setFeeRatio(asciiFromChainID, asciiToChainID, 100);
  // await delegate.addAdmin(admin);
  // await delegate.mintToken(1, other, 100, {from: admin});
  // const value = web3.utils.toBN(await oracleDelegate.getValue(tokenSymbol)).toNumber();

  // await oracleDelegate.updatePrice([tokenSymbol], [v], { from: white });
}