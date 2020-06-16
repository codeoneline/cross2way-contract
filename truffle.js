module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 10000000,
      gasPrice: 1000000000,
    },
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 10000000,
      gasPrice: 1000000000,
      from:'0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e',
    },
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