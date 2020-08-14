module.exports = {
  networks: {
    development: {
      host: "192.168.1.179",
      port: 18545,
      network_id: "*",
      gas: 10000000,
      gasPrice: 180000000000,
      from:'0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8',
    },
    wan179: {
      host: "192.168.1.179",
      port: 18545,
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
      version: '0.7.0',
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