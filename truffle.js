const HDWalletProvider = require('truffle-hdwallet-provider');
const PrivateKeyProvider = require('truffle-privatekey-provider');
console.log(`truffle pk = ${process.env.PK}`);

module.exports = {
  networks: {
    development: {
      // host: "192.168.1.2",
      // port: 8545,
      // network_id: "*",
      // gas: 10000000,
      // gasPrice: 180000000000,
      // admin: '0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e', 
      // from:'0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8',
      // other:'0xced44c4eb4c1910502d2b0759eb1e8013de543e3',
      provider: new PrivateKeyProvider(process.env.PK, 'https://rinkeby.infura.io/v3/4acb62eacb3442a38cd79a52b6cade64'),
      network_id: "*",
      gas: 8000000,
      gasPrice: 10000000000
    },
    wan179: {
      host: "192.168.1.179",
      port: 18545,
      network_id: "*",
      gas: 10000000,
      gasPrice: 180000000000,
      from:'0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8',
    },
    wan_testnet: {
      host: "192.168.1.2",
      port: 8545,
      network_id: "*",
      gas: 10000000,
      gasPrice: 180000000000,
      from:'0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8',
    },
    wan179_7654: {
      host: "192.168.1.179",
      port: 7654,
      network_id: "*",
      gas: 10000000,
      gasPrice: 180000000000,
      from:'0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8',
    },
    eth179: {
      host: "192.168.1.179",
      port: 28545,
      network_id: "*",
      gas: 8000000,
      gasPrice: 20000000000,
      from:'0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8',
    },
    eth_rinkeby: {
      // provider: new HDWalletProvider(process.env.PK, 'https://rinkeby.infura.io/v3/4acb62eacb3442a38cd79a52b6cade64'),
      provider: new PrivateKeyProvider(process.env.PK, 'https://rinkeby.infura.io/v3/4acb62eacb3442a38cd79a52b6cade64'),
      network_id: "*",
      gas: 8000000,
      gasPrice: 10000000000
    },
    // eth_ropsten: {
    //   provider: new PrivateKeyProvider(process.env.PK, 'https://ropsten.infura.io/v3/4acb62eacb3442a38cd79a52b6cade64'),
    //   network_id: 3,
    //   gas: 8000000,
    //   gasPrice: 10000000000
    // },

    // eth_mainnet: {
    //   provider: function() {
    //     // mnemonic
    //     return new HDWalletProvider(process.env.PK, 'https://mainnet.infura.io')
    //   } ,
    //   network_id: 1,
    //   gas: 8000000,
    //   gasPrice: 10000000000
    // },
    etc179: {
      host: "192.168.1.179",
      port: 38545,
      network_id: "*",
      gas: 8000000,
      gasPrice: 20000000000,
      from:'0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8',
    },
    eth127: {
      host: "127.0.0.1",
      port: 28545,
      network_id: "*",
      gas: 10000000,
      gasPrice: 20000000000,
      from:'0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8',
    },
    // test: {
    //   host: "127.0.0.1",
    //   port: 8545,
    //   network_id: "*",
    //   gas: 10000000,
    //   gasPrice: 1000000000,
    //   from:'0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e',
    // },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 6545,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
  },
  plugins: ["solidity-coverage"],
  mocha: {
    useColors: true,
    enableTimeouts: false,
  },
  compilers: {
    solc: {
      version: '0.4.26',
      docker: false,
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: 'byzantium'
      },
    },
  },
}