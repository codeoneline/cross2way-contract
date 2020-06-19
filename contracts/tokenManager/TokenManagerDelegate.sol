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
        require(!(mapTokenPairInfo[id].isDelete), "token deleted");
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

    /// @notice                      add a supported token
    /// @dev                         add a supported token
    /// @param id                    token pair id start from 1
    /// @param aInfo                 token ancestor info
    /// @param fromChainID           token from chainID
    /// @param toChainID             token to chainID
    /// @param fromAccount           token from address
    /// @param tokenInfo             token name symbol and decimals
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
    /// @param ancestorChainID       token ancestor chainID
    function updateAncestorInfo(
        uint    id,

        bytes   ancestorAccount,
        bytes   ancestorName,
        bytes   ancestorSymbol,
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
        mapAncestorInfo[id].ancestorChainID = ancestorChainID;
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

    function removeTokenPair(
        uint id
    )
        public
        onlyOwner
        onlyValidID(id)
    {
        mapTokenPairInfo[id].isDelete = true;
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
        view
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

    function getTokenPairInfo(
        uint id
    )
        public
        view
        returns (uint fromChainID, uint toChainID, bytes fromAccount, address toAccount, bool isDelete)
    {
        fromChainID = mapTokenPairInfo[id].fromChainID;
        toChainID = mapTokenPairInfo[id].toChainID;
        fromAccount = mapTokenPairInfo[id].fromAccount;
        toAccount = mapTokenPairInfo[id].toAccount;
        isDelete = mapTokenPairInfo[id].isDelete;
    }

    function getTokenInfo(uint id) public view returns (address addr, string name, string symbol, uint8 decimals) {
        address instance = mapTokenPairInfo[id].toAccount;
        name = IMappingToken(instance).name();
        symbol = IMappingToken(instance).symbol();
        decimals = IMappingToken(instance).decimals();
        addr = instance;
    }

    function getAncestorInfo(uint id) public view returns (bytes account, bytes name, bytes symbol, uint8 decimals, uint chainId) {
        account = mapAncestorInfo[id].ancestorAccount;
        name = mapAncestorInfo[id].ancestorName;
        symbol = mapAncestorInfo[id].ancestorSymbol;
        decimals = mapAncestorInfo[id].ancestorDecimals;
        chainId = mapAncestorInfo[id].ancestorChainID;
    }
}
