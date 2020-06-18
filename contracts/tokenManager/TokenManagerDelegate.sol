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

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

/**
 * Math operations with safety checks
 */

import "../components/Owned.sol";
import "./TokenManagerStorage.sol";
import "./MappingToken.sol";
import "./IMappingToken.sol";

contract TokenManagerDelegate is TokenManagerStorage, Owned {
    /**
     *
     * EVENTS
     *
     */
     event TokenAdd(uint id, address toAccount, bytes name, bytes symbol, uint8 decimals);

    /**
     *
     * MODIFIERS
     *
     */

    modifier onlyValidAccount(bytes account) {
        require(account.length != 0, "Account is null");
        _;
    }

    modifier onlyValidID(uint id) {
        require(mapTokenPairInfo[id].toAccount != address(0), "token Pair not exists");
        _;
    }

    modifier onlyMeaningfulValue(uint value) {
        require(value > 0, "Value is null");
        _;
    }

    modifier onChain(uint from, uint to) {
        require(from != to, "same chain");
        require((from == chainID) || (to == chainID), "not this chain");
        _;
    }

    modifier onlyAdmin() {
        require(mapAdmin[msg.sender], "not admin");
        _;
    }

    /**
    *
    * MANIPULATIONS
    *
    */

    /// @notice If WAN coin is sent to this address, send it back.
    /// @dev If WAN coin is sent to this address, send it back.
    function() external payable {
        revert("Not support");
    }


    /// @notice                      add a supported token
    /// @dev                         add a supported token
    /// @param x                     x address
    function toBytes(address x) public pure returns (bytes b) {
        b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    }

    // /// @notice                      add a supported token
    // /// @dev                         add a supported token
    // /// @param id                    token pair id start from 1
    // /// @param ancestorAccount       token ancestor address
    // /// @param ancestorName          token ancestor name
    // /// @param ancestorSymbol        token ancestor symbol
    // /// @param ancestorDecimals      token ancestor decimals
    // /// @param ancestorChainID       token ancestor chainID
    // /// @param fromChainID           token from chainID
    // /// @param toChainID             token to chainID
    // /// @param fromAccount           token from address
    // /// @param name                  token name
    // /// @param symbol                token symbol
    // /// @param decimals              token decimals
    // function addTokenPair(
    //     uint    id,

    //     bytes   ancestorAccount,
    //     bytes   ancestorName,
    //     bytes   ancestorSymbol,
    //     uint8   ancestorDecimals,
    //     uint    ancestorChainID,

    //     uint    fromChainID,
    //     uint    toChainID,
    //     bytes   fromAccount,

    //     bytes   name,
    //     bytes   symbol,
    //     uint8   decimals
    // )
    //     public
    //     onlyOwner
    //     onlyValidAccount(ancestorAccount)
    //     onlyValidAccount(fromAccount)
    // {
    //     // id should not exist
    //     require(id == totalTokenPairs + 1, "id is 0");
    //     require(mapTokenPairInfo[id].toAccount.length > 0, "token Pair exists");
    //     // check ancestor
    //     require(ancestorName.length != 0, "ancestorName is null");
    //     require(ancestorSymbol.length != 0, "ancestorSymbol is null");
    //     // check pair
    //     require((fromChainID == chainID) || (toChainID == chainID), "chainId is wrong");
    //     // check token
    //     require(name.length != 0, "name is null");
    //     require(symbol.length != 0, "symbol is null");

    //     // generate a w-token contract instance
    //     address tokenInst = new MappingToken(string(name), string(symbol), decimals);
    //     bytes memory toAccount = toBytes(tokenInst);

    //     // create a new record
    //     mapTokenPairInfo[id] = TokenPairInfo(fromChainID, toChainID, fromAccount, toAccount, false);
    //     mapAncestorInfo[id] = AncestorInfo(ancestorAccount, ancestorName, ancestorSymbol, ancestorDecimals, ancestorChainID);
    //     mapTokenInfo[id] = TokenInfo(name, symbol, decimals);

    //     totalTokenPairs = totalTokenPairs + 1;

    //     // fire event
    //     emit TokenAdd(id, toAccount, name, symbol, decimals);
    // }

    function addTokenPair(
        uint    id,

        AncestorInfo aInfo,

        uint    fromChainID,
        uint    toChainID,
        bytes   fromAccount,

        TokenInfo tokenInfo
    )
        public
        onlyOwner
        onlyValidAccount(aInfo.ancestorAccount)
        onlyValidAccount(fromAccount)
        onChain(fromChainID, toChainID)
    {
        // id should not exist
        require(id == totalTokenPairs + 1, "id is 0");
        require(mapTokenPairInfo[id].toAccount == address(0), "token Pair exists");
        // check ancestor
        require(aInfo.ancestorName.length != 0, "ancestorName is null");
        require(aInfo.ancestorSymbol.length != 0, "ancestorSymbol is null");
        // check token
        require(tokenInfo.name.length != 0, "name is null");
        require(tokenInfo.symbol.length != 0, "symbol is null");

        // generate a w-token contract instance
        address tokenInst = new MappingToken(string(tokenInfo.name), string(tokenInfo.symbol), tokenInfo.decimals);

        // create a new record
        mapTokenPairInfo[id] = TokenPairInfo(fromChainID, toChainID, fromAccount, tokenInst, false);
        mapAncestorInfo[id] = AncestorInfo(aInfo.ancestorAccount, aInfo.ancestorName, aInfo.ancestorSymbol,
                                        aInfo.ancestorDecimals, aInfo.ancestorChainID);
        mapTokenInfo[id] = TokenInfo(tokenInfo.name, tokenInfo.symbol, tokenInfo.decimals);

        totalTokenPairs = totalTokenPairs + 1;

        // fire event
        emit TokenAdd(id, tokenInst, tokenInfo.name, tokenInfo.symbol, tokenInfo.decimals);
    }

    /// @notice                      add a supported token
    /// @dev                         add a supported token
    /// @param id                    token pair id start from 1
    /// @param ancestorAccount       token ancestor address
    /// @param ancestorName          token ancestor name
    /// @param ancestorSymbol        token ancestor symbol
    /// @param ancestorDecimals      token ancestor decimals
    /// @param ancestorChainID       token ancestor chainID
    function updateAncestorInfo(
        uint    id,

        bytes   ancestorAccount,
        bytes   ancestorName,
        bytes   ancestorSymbol,
        uint8   ancestorDecimals,
        uint    ancestorChainID
    )
        public
        onlyOwner
        onlyValidAccount(ancestorAccount)
        onlyValidID(id)
    {
        require(ancestorName.length != 0, "ancestorName is null");
        require(ancestorSymbol.length != 0, "ancestorSymbol is null");

        mapAncestorInfo[id].ancestorAccount = ancestorAccount;
        mapAncestorInfo[id].ancestorName = ancestorName;
        mapAncestorInfo[id].ancestorSymbol = ancestorSymbol;
        mapAncestorInfo[id].ancestorDecimals = ancestorDecimals;
        mapAncestorInfo[id].ancestorChainID = ancestorChainID;
    }

    /// @notice                      add a supported token
    /// @dev                         add a supported token
    /// @param id                    token pair id start from 1
    /// @param name                  token name
    /// @param symbol                token symbol
    /// @param decimals              token decimals
    function updateTokenInfo(
        uint    id,

        bytes   name,
        bytes   symbol,
        uint8   decimals
    )
        public
        onlyOwner
        onlyValidID(id)
    {
        require(name.length != 0, "name is null");
        require(symbol.length != 0, "symbol is null");

        mapTokenInfo[id].name = name;
        mapTokenInfo[id].symbol = symbol;
        mapTokenInfo[id].decimals = decimals;
    }

    /// @notice                      add a supported token
    /// @dev                         add a supported token
    /// @param id                    token pair id start from 1
    /// @param fromChainID           token from chainID
    /// @param toChainID             token to chainID
    /// @param fromAccount           token from address
    function updateTokenPair(
        uint    id,

        uint    fromChainID,
        uint    toChainID,
        bytes   fromAccount
    )
        public
        onlyOwner
        onlyValidAccount(fromAccount)
        onlyValidID(id)
        onChain(fromChainID, toChainID)
    {
        mapTokenPairInfo[id].fromChainID = fromChainID;
        mapTokenPairInfo[id].toChainID = toChainID;
        mapTokenPairInfo[id].fromAccount = fromAccount;
    }

    function mintToken(
        uint    id,
        address to,
        uint    value
    )
        public
        onlyAdmin
        onlyValidID(id)
        onlyMeaningfulValue(value)
    {
        address instance = mapTokenPairInfo[id].toAccount;
        IMappingToken(instance).mint(to, value);
    }

    function burnToken(
        uint    id,
        uint    value
    )
        public
        onlyAdmin
        onlyValidID(id)
        onlyMeaningfulValue(value)
    {
        address instance = mapTokenPairInfo[id].toAccount;
        IMappingToken(instance).burn(msg.sender, value);
    }

    function setFeeRatio(
        uint fromChainID,
        uint toChainID,
        uint feeRatio
    )
        public
        onlyOwner
        onChain(fromChainID, toChainID)
    {
        if (fromChainID == chainID) {
            mapToFeeRatio[toChainID] = feeRatio;
        } else {
            mapFromFeeRatio[fromChainID] = feeRatio;
        }
    }

    function getFeeRatio(
        uint fromChainID,
        uint toChainID
    )
        public
        onlyOwner
        returns (uint)
    {
        if (fromChainID == chainID) {
            return mapToFeeRatio[toChainID];
        } else {
            return mapFromFeeRatio[fromChainID];
        }
    }

    function addAdmin(
        address admin
    )
        public
        onlyOwner
    {
        mapAdmin[admin] = true;
    }

    function removeAdmin(
        address admin
    )
        public
        onlyOwner
    {
        delete mapAdmin[admin];
    }
}
