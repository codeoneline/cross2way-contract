const TokenManagerProxy = artifacts.require('TokenManagerProxy');
const TokenManagerDelegate = artifacts.require('TokenManagerDelegate');
const OracleProxy = artifacts.require('OracleProxy');
const OracleDelegate = artifacts.require('OracleDelegate');
const StoremanGroupAdmin = artifacts.require('StoremanGroupAdmin');

const MappingToken = artifacts.require('MappingToken');

module.exports = async (deployer, network, accounts) => {
  const [owner, admin, other] = accounts;
  // deploy token manager delegate
  await deployer.deploy(TokenManagerDelegate);
  const delegate = await TokenManagerDelegate.deployed();
  // deploy token manager proxy
  // await deployer.deploy(TokenManagerProxy);
  // const proxy = await TokenManagerProxy.deployed();
  // // token manager proxy upgrade to token manager delegate
  // await proxy.upgradeTo(delegate.address);

  // deploy oracle delegate
  await deployer.deploy(OracleDelegate);
  const oracleDelegate = await OracleDelegate.deployed();
  // await deployer.deploy(OracleProxy);
  // const oracleProxy = await OracleProxy.deployed();
  // // oracle proxy upgrade to oracle delegate
  // await oracleProxy.upgradeTo(oracleDelegate.address);

  // await deployer.deploy(StoremanGroupAdmin);
  // await StoremanGroupAdmin.deployed();

  // const link = await MappingToken.new('link on eth to os', 'LINK', 18);
  // console.log(`address = ${link.address}`)
  // const fnx = await MappingToken.new('fnx on wan os', 'FNX', 18);
  // console.log(`fnx address = ${fnx.address}`)
}