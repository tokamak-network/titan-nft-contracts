// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../universal/Proxy.sol";
import "./L2ERC721BridgeStorage.sol";

contract L2ERC721BridgeProxy is Proxy, L2ERC721BridgeStorage
{
    constructor(address _admin) Proxy(_admin){
    }

    modifier onlyOwner() {
        require(
            msg.sender == admin(), "sender is not owner"
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
