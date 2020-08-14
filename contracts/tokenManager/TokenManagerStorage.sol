/*

  Copyright 2019 Wanchain Foundation.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

*/

//                            _           _           _
//  __      ____ _ _ __   ___| |__   __ _(_)_ __   __| | _____   __
//  \ \ /\ / / _` | '_ \ / __| '_ \ / _` | | '_ \@/ _` |/ _ \ \ / /
//   \ V  V / (_| | | | | (__| | | | (_| | | | | | (_| |  __/\ V /
//    \_/\_/ \__,_|_| |_|\___|_| |_|\__,_|_|_| |_|\__,_|\___| \_/
//
//
// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "../components/BasicStorage.sol";

contract TokenManagerStorage is BasicStorage {
    /************************************************************
     **
     ** STRUCTURE DEFINATIONS
     **
     ************************************************************/

    struct AncestorInfo {
      bytes   account;
      string  name;
      string  symbol;
      uint8   decimals;
      uint    chainID;
    }

    struct TokenPairInfo {
      AncestorInfo aInfo;
      uint      fromChainID;
      bytes     fromAccount;
      uint      toChainID;
      bytes     toAccount;
    }


    /************************************************************
     **
     ** VARIABLES
     **
     ************************************************************/

    /// total amount of TokenPair instance
    uint public totalTokenPairs = 0;
    /// only HTLC contract address can mint and burn token
    mapping(address => bool) public mapAdmin;

    // a map from a sequence ID to token pair
    mapping(uint => TokenPairInfo) mapTokenPairInfo;
    // index -> tokenPairId
    mapping(uint => uint) public mapTokenPairIndex;
}