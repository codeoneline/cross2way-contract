const TokenManagerProxy = artifacts.require('TokenManagerProxy');
const TokenManagerDelegate = artifacts.require('TokenManagerDelegate');
const OracleProxy = artifacts.require('OracleProxy');
const OracleDelegate = artifacts.require('OracleDelegate');
const StoremanGroupAdmin = artifacts.require('StoremanGroupAdmin');

const MappingToken = artifacts.require('MappingToken');

module.exports = async (deployer, network, accounts) => {
  const [owner, admin, other] = accounts;
  // // deploy token manager delegate
  // await deployer.deploy(TokenManagerDelegate);
  // const delegate = await TokenManagerDelegate.deployed();
  // // deploy token manager proxy
  // await deployer.deploy(TokenManagerProxy);
  // const proxy = await TokenManagerProxy.deployed();
  // // token manager proxy upgrade to token manager delegate
  // await proxy.upgradeTo(delegate.address);

  // // deploy oracle delegate
  // await deployer.deploy(OracleDelegate);
  // const oracleDelegate = await OracleDelegate.deployed();
  // await deployer.deploy(OracleProxy);
  // const oracleProxy = await OracleProxy.deployed();
  // // oracle proxy upgrade to oracle delegate
  // await oracleProxy.upgradeTo(oracleDelegate.address);

  // await deployer.deploy(StoremanGroupAdmin);
  // await StoremanGroupAdmin.deployed();


  // const etcToken = await MappingToken.new('token on etc to os', 'TOKEN', 18);
  // console.log(`etc address = ${etcToken.address}`)
  // const link = await MappingToken.new('link on eth to os', 'LINK', 18);
  // console.log(`link address = ${link.address}`)
  // const fnx = await MappingToken.new('fnx on wan os', 'FNX', 18);
  // console.log(`fnx address = ${fnx.address}`)
  // const btc = await MappingToken.new('btc on wan', 'BTC', 18);
  // console.log(`btc address = ${btc.address}`)
  // const eos = await MappingToken.new('eos on wan', 'EOS', 18);
  // console.log(`eos address = ${eos.address}`)

  console.log(`deployer pk = ${process.env.PK}`)
  console.log(`account ${accounts}`);
  const wan2eth = await MappingToken.new('WAN@ethereum', 'wanETH', 18);
  console.log(`wan2eth address = ${wan2eth.address}`)
  const btc2eth = await MappingToken.new('wanBTC@ethereum', 'wanBTC', 18);
  console.log(`btc2eth address = ${btc2eth.address}`)
  const eos2eth = await MappingToken.new('wanEOS@ethereum', 'wanEOS', 18);
  console.log(`eos2eth address = ${eos2eth.address}`)


  // const aAccount = web3.utils.hexToBytes("0x6b175474e89094c44da98b954eedeac495271d0f");
  // const aNewAccount = web3.utils.hexToBytes("0x0b175474e89094c44da98b954eedeac495271d0f");
  // const aName = "eth dai";
  // const aSymbol = "DAI";
  // const aDecimals = 18;
  // const aChainID = 60;

  // const fromChainID = 60;
  // const toChainID = 5718350;
  // const decimals = 18;
  // const fromAccount = web3.utils.hexToBytes('0x7b175474e89094c44da98b954eedeac495271d0f');

  // const nameDAI = 'ETH DAI';
  // const symbolDAI = 'DAI';
  // const nameDAI_NEW = 'NEW ETH DAI';
  // const symbolDAI_NEW = 'NEW DAI';
  // const nameETH = 'ETH ETH';
  // const symbolETH = 'ETH';
  // const nameBTC = 'BTC BTC';
  // const symbolBTC = 'BTC';

  // const addTokenPairParam = [1, [aAccount, aName, aSymbol, aDecimals, aChainID], 
  //     fromChainID, fromAccount, toChainID, "0x7b175474e89094c44da98b954eedeac495271d0f"];

  // for(let i =0; i<500; i++) {
  //   await delegate.addTokenPair(...addTokenPairParam, {from: owner});
  //   addTokenPairParam[0] = addTokenPairParam[0] + 1;
  // }
}