const TokenManagerProxy = artifacts.require('TokenManagerProxy');
const TokenManagerDelegate = artifacts.require('TokenManagerDelegate');

module.exports = async (deployer) => {
  // deploy proxy
  await deployer.deploy(TokenManagerProxy);
  let proxy = await TokenManagerProxy.deployed();
  // deploy delegate
  await deployer.deploy(TokenManagerDelegate);
  let delegate = await TokenManagerDelegate.deployed();
  // proxy upgrade to delegate
  await proxy.upgradeTo(delegate.address);

  
}