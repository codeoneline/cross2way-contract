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

// homestead (oldest version)
// tangerineWhistle
// Gas cost for access to other accounts increased, relevant for gas estimation and the optimizer.
// All gas sent by default for external calls, previously a certain amount had to be retained.
// spuriousDragon
// Gas cost for the exp opcode increased, relevant for gas estimation and the optimizer.
// byzantium
// Opcodes returndatacopy, returndatasize and staticcall are available in assembly.
// The staticcall opcode is used when calling non-library view or pure functions, which prevents the functions from modifying state at the EVM level, i.e., even applies when you use invalid type conversions.
// It is possible to access dynamic data returned from function calls.
// revert opcode introduced, which means that revert() will not waste gas.
// constantinople
// Opcodes create2`, ``extcodehash, shl, shr and sar are available in assembly.
// Shifting operators use shifting opcodes and thus need less gas.
// petersburg (default)
// The compiler behaves the same way as with constantinople.
// istanbul
// Opcodes chainid and selfbalance are available in assembly.
// berlin (experimental)