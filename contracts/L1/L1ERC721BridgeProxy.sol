// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../universal/Proxy.sol";
import "./L1ERC721BridgeStorage.sol";

contract L1ERC721BridgeProxy is Proxy, L1ERC721BridgeStorage
{
    constructor(address _admin) Proxy(_admin){
    }

    modifier onlyOwner() {
        require(
            msg.sender == admin(), "sender is not admin"
        );
        _;
    }

    function owner() external virtual returns (address) {
        return _getAdmin();
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        _changeAdmin(newOwner);
    }

}
