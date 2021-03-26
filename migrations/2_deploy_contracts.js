const TokenManagerProxy = artifacts.require('TokenManagerProxy');
const TokenManagerDelegate = artifacts.require('TokenManagerDelegate');
const OracleProxy = artifacts.require('OracleProxy');
const OracleDelegate = artifacts.require('OracleDelegate');
const StoremanGroupAdmin = artifacts.require('StoremanGroupAdmin');
const WwanToken = artifacts.require('WwanToken');

const MappingToken = artifacts.require('MappingToken');

const tms = {
  "wan": {
    "mainnet": '0x9fdf94dff979dbecc2c1a16904bdfb41d305053a',
    "testnet": '0x017ab6485ff91c1a0a16b90e71f92b935b7213d3',
  },
  "eth": {
    "mainnet": '0xbab93311de250b5b422c705129b3617b3cb6e9e1',
    "testnet": '0x9f35da7049fd6cf80c5fe77e2e94bfd969fae16a',
  }
}

async function DeployMapToken(name, symbol, decimals, network) {
  const [chain, net] = network.split('-')[0].split('_')
  tm = tms[chain][net]
  if (tm.length !== 42) {
    console.log(`wrong network ${network}`)
    return 
  }
  console.log(`tm is ${tm}`)
  const mapToken = await MappingToken.new(name, symbol, decimals);
  console.log(`mapToken address = ${mapToken.address}`)
  const mapToken_old_owner = await mapToken.owner()
  console.log(`mapToken old owner is ${mapToken_old_owner}`)
  await mapToken.transferOwner(tm);
  const mapToken_new_owner = await mapToken.owner()
  console.log(`mapToken new owner is ${mapToken_new_owner}`)
}

module.exports = async (deployer, network, accounts) => {
  console.log(`...network= ${network}`)
  global.network = network;
  const [owner, admin, other] = accounts;
  // // deploy token manager delegate
  // await deployer.deploy(TokenManagerDelegate);
  // const delegate = await TokenManagerDelegate.deployed();
  // // deploy token manager proxy
  // await deployer.deploy(TokenManagerProxy);
  // const proxy = await TokenManagerProxy.deployed();
  // // token manager proxy upgrade to token manager delegate
  // const tx = await proxy.upgradeTo(delegate.address);
  // console.log(JSON.stringify(tx.receipt.gasUsed))

  // // wan testnet
  // await deployer.deploy(TokenManagerDelegate);
  // const delegate = await TokenManagerDelegate.deployed();
  // const proxy = await TokenManagerProxy.at("0x017ab6485ff91c1a0a16b90e71f92b935b7213d3");
  // console.log(`token manager delegate : ${delegate.address}`)
  // await proxy.upgradeTo(delegate.address);

  // // wan testnet oracle
  // await deployer.deploy(OracleDelegate);
  // const oracleDelegate = await OracleDelegate.deployed();
  // const oracleProxy = await OracleProxy.at("0x27933a9b0a5c21b838843d7601b6e0b488122ae9");
  // console.log(`oracleDelegate : ${oracleDelegate.address}`)
  // await oracleProxy.upgradeTo(oracleDelegate.address);

  // // rinkeby testnet token manager
  // await deployer.deploy(TokenManagerDelegate);
  // const delegate = await TokenManagerDelegate.deployed();
  // const proxy = await TokenManagerProxy.at("0x9f35da7049FD6CF80c5fe77e2E94bFD969FaE16A");
  // console.log(`token manager delegate : ${delegate.address}`)
  // await proxy.upgradeTo(delegate.address);

  // rinkeby testnet oracle
  // await deployer.deploy(OracleDelegate);
  // const oracleDelegate = await OracleDelegate.deployed();
  // const oracleProxy = await OracleProxy.at("0xf728fb2e26be1f12496d9f68bddfe1eac0ebfd26");
  // console.log(`oracleDelegate : ${oracleDelegate.address}`)
  // await oracleProxy.upgradeTo(oracleDelegate.address);

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
  // const link = await MappingToken.new('Chain Link', 'LINK', 18);
  // console.log(`link address = ${link.address}`)
  // const fnx = await MappingToken.new('FinNexus', 'FNX', 18);
  // console.log(`fnx address = ${fnx.address}`)
  // const btc = await MappingToken.new('btc', 'BTC', 8);
  // console.log(`btc address = ${btc.address}`)
  // const eos = await MappingToken.new('eos', 'EOS', 4);
  // console.log(`eos address = ${eos.address}`)

  // const uni = await MappingToken.new('wanUNI@wanchain', 'wanUNI', 18);
  // const uni_old_owner = await uni.owner()
  // console.log(`uni address = ${uni.address}, owner is ${uni_old_owner}`)
  // await uni.transferOwner("0x9fdf94dff979dbecc2c1a16904bdfb41d305053a");
  // const uni_new_owner = await uni.owner()
  // console.log(`uni new owner is ${uni_new_owner}`)

  // const receipt = await deployer.deploy(MappingToken, 'WAN@ethereum', 'WAN', 18)
  // console.log(JSON.stringify(receipt));
  // const delegate = await MappingToken.deployed();

  // console.log(`deployer pk = ${process.env.PK}`)
  // console.log(`account ${accounts}`);
  // const wan2eth = await MappingToken.new('WAN@ethereum', 'WAN', 18);
  // console.log(`wan2eth address = ${wan2eth.address}`)

  // const btc2eth = await MappingToken.new('wanBTC@ethereum', 'wanBTC', 8);
  // console.log(`btc2eth address = ${btc2eth.address}`)
  // const eos2eth = await MappingToken.new('wanEOS@ethereum', 'wanEOS', 4);
  // console.log(`eos2eth address = ${eos2eth.address}`)

  // const btc2wan = await MappingToken.new('wanBTC@wanchain', 'wanBTC', 8);
  // const btc2wan_old_owner = await btc2wan.owner()
  // console.log(`btc2wan address = ${btc2wan.address}, owner is ${btc2wan_old_owner}`)
  // await btc2wan.transferOwner("0x9fdf94dff979dbecc2c1a16904bdfb41d305053a");

  // await DeployMapToken('wanBTC@wanchain', 'wanBTC', 8, network);
  // await DeployMapToken('wanZCN@wanchain', 'wanZCN', 10, network);
  await DeployMapToken('wanVIBE@wanchain', 'wanVIBE', 18, network);

  // const sushi2wan = await MappingToken.new('wanSUSHI@wanchain', 'wanSUSHI', 18);
  // const sushi2wan_old_owner = await sushi2wan.owner()
  // console.log(`sushi2wan address = ${sushi2wan.address}`)
  // await sushi2wan.transferOwner("0x017ab6485ff91c1a0a16b90e71f92b935b7213d3");
  // const sushi2wan_new_owner = await sushi2wan.owner()
  // console.log(`sushi2wan new owner is ${sushi2wan_new_owner}`)

  // const sushi2wan = await MappingToken.new('wanSUSHI@wanchain', 'wanSUSHI', 18);
  // const sushi2wan_old_owner = await sushi2wan.owner()
  // console.log(`sushi2wan address = ${sushi2wan.address}`)
  // console.log(`sushi2wan old owner is = ${sushi2wan_old_owner}`)
  // await sushi2wan.transferOwner("0x9fdf94dff979dbecc2c1a16904bdfb41d305053a");
  // const sushi2wan_new_owner = await sushi2wan.owner()
  // console.log(`sushi2wan new owner is ${sushi2wan_new_owner}`)

//    // wwan
//  await deployer.deploy(WwanToken);
//  const wwan = await WwanToken.deployed();
//  console.log("wwan: " + wwan.address);

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