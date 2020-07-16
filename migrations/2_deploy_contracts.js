const TokenManagerProxy = artifacts.require('TokenManagerProxy');
const TokenManagerDelegate = artifacts.require('TokenManagerDelegate');
const OracleProxy = artifacts.require('OracleProxy');
const OracleDelegate = artifacts.require('OracleDelegate');
const StoremanGroupAdmin = artifacts.require('StoremanGroupAdmin');

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

  await deployer.deploy(StoremanGroupAdmin);
  await StoremanGroupAdmin.delegated();
}