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
    using SafeMath for uint;
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
        require(mapTokenPairInfo[id].tokenAddress != address(0), "id not exists");
        require(!(mapTokenPairInfo[id].isDelete), "token deleted");
        _;
    }

    modifier onlyMeaningfulValue(uint value) {
        require(value > 0, "Value is null");
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


    // function toBytes(address x) public pure returns (bytes b) {
    //     b = new bytes(20);
    //     for (uint i = 0; i < 20; i++)
    //         b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    // }

    // function bytesToAddress(bytes _address) public returns (address) {
    //     uint160 m = 0;
    //     uint160 b = 0;

    //     for (uint8 i = 0; i < 20; i++) {
    //         m *= 256;
    //         b = uint160(_address[i]);
    //         m += (b);
    //     }

    //     return address(m);
    // }

    function addToken(
        bytes name,
        bytes symbol,
        uint8 decimals
    )
        external
        onlyOwner
    {
        // check token
        require(name.length != 0, "name is null");
        require(symbol.length != 0, "symbol is null");

        address tokenAddress = new MappingToken(string(name), string(symbol), decimals);
        // fire event
        emit TokenAdd(tokenAddress, name, symbol, decimals);
    }

    /// @notice                      add a token pair
    /// @dev                         add a token pair
    /// @param id                    token pair id start from 1
    /// @param aInfo                 token ancestor info
    /// @param fromChainID           token from chainID
    /// @param fromAccount           token from address
    /// @param toChainID             token to chainID
    /// @param tokenAddress          token address
    function addTokenPair(
        uint    id,

        AncestorInfo aInfo,

        uint    fromChainID,
        bytes   fromAccount,
        uint    toChainID,
        address tokenAddress
    )
        public
        onlyOwner
        onlyValidAccount(aInfo.ancestorAccount)
        onlyValidAccount(fromAccount)
    {
        // id should not exist
        require(id == totalTokenPairs.add(1), "id is 0");
        // // check ancestor
        require(aInfo.ancestorName.length != 0, "ancestorName is null");
        require(aInfo.ancestorSymbol.length != 0, "ancestorSymbol is null");

        // create a new record
        mapTokenPairInfo[id] = TokenPairInfo(fromChainID, fromAccount, toChainID, tokenAddress, false);
        mapAncestorInfo[id] = AncestorInfo(aInfo.ancestorAccount, aInfo.ancestorName, aInfo.ancestorSymbol,
                                    aInfo.ancestorDecimals, aInfo.ancestorChainID);

        totalTokenPairs = totalTokenPairs.add(1);

        // fire event
        emit TokenPairAdd(id, fromChainID, fromAccount, toChainID, tokenAddress);
    }

    /// @notice                      update ancestor token info
    /// @dev                         update
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
        onlyValidID(id)
        onlyValidAccount(ancestorAccount)
    {
        require(ancestorName.length != 0, "ancestorName is null");
        require(ancestorSymbol.length != 0, "ancestorSymbol is null");

        mapAncestorInfo[id].ancestorAccount = ancestorAccount;
        mapAncestorInfo[id].ancestorName = ancestorName;
        mapAncestorInfo[id].ancestorSymbol = ancestorSymbol;
        mapAncestorInfo[id].ancestorChainID = ancestorChainID;

        emit UpdateAncestorInfo(id, ancestorAccount, ancestorName, ancestorSymbol, ancestorChainID);
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
        bytes   fromAccount,

        uint     toChainID,
        address  tokenAddress
    )
        public
        onlyOwner
        onlyValidID(id)
        onlyValidAccount(fromAccount)
    {
        mapTokenPairInfo[id].fromChainID = fromChainID;
        mapTokenPairInfo[id].fromAccount = fromAccount;
        mapTokenPairInfo[id].toChainID = toChainID;
        mapTokenPairInfo[id].tokenAddress = tokenAddress;

        emit UpdateTokenPair(id, fromChainID, fromAccount, toChainID, tokenAddress);
    }

    function removeTokenPair(
        uint id
    )
        public
        onlyOwner
        onlyValidID(id)
    {
        mapTokenPairInfo[id].isDelete = true;

        emit RemoveTokenPair(id);
    }

    function mintToken(
        uint    id,
        address to,
        uint    value
    )
        public
        onlyAdmin
        onlyValidID(id)
    {
        address instance = mapTokenPairInfo[id].tokenAddress;
        IMappingToken(instance).mint(to, value);

        emit MintToken(id, to, value);
    }

    function burnToken(
        uint    id,
        uint    value
    )
        public
        onlyAdmin
        onlyValidID(id)
    {
        address instance = mapTokenPairInfo[id].tokenAddress;
        IMappingToken(instance).burn(msg.sender, value);

        emit BurnToken(id, value);
    }

    function setFeeRatio(
        uint fromChainID,
        uint toChainID,
        uint feeRatio
    )
        public
        onlyOwner
    {
        mapFeeRatio[fromChainID][toChainID] = feeRatio;

        emit SetFeeRatio(fromChainID, toChainID, feeRatio);
    }

    function getFeeRatio(
        uint fromChainID,
        uint toChainID
    )
        public
        view
        returns (uint)
    {
        return mapFeeRatio[fromChainID][toChainID];
    }

    function addAdmin(
        address admin
    )
        public
        onlyOwner
    {
        mapAdmin[admin] = true;

        emit AddAdmin(admin);
    }

    function removeAdmin(
        address admin
    )
        public
        onlyOwner
    {
        delete mapAdmin[admin];

        emit RemoveAdmin(admin);
    }

    function getTokenPairInfo(
        uint id
    )
        public
        view
        returns (uint fromChainID, bytes fromAccount, uint toChainID, address tokenAddress, bool isDelete)
    {
        fromChainID = mapTokenPairInfo[id].fromChainID;
        fromAccount = mapTokenPairInfo[id].fromAccount;
        toChainID = mapTokenPairInfo[id].toChainID;
        tokenAddress = mapTokenPairInfo[id].tokenAddress;
        isDelete = mapTokenPairInfo[id].isDelete;
    }

    function getTokenInfo(uint id) public view returns (address addr, string name, string symbol, uint8 decimals) {
        address instance = mapTokenPairInfo[id].tokenAddress;
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
