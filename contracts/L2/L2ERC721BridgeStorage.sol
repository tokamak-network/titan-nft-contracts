// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract L2ERC721BridgeStorage {

    /**
     * @notice Messenger contract on this domain. (CrossDomainMessenger)
     */
    address public MESSENGER;

    /**
     * @notice Address of the bridge on the other network.
     */
    address public OTHER_BRIDGE;

    /**
     * @notice Reserve extra slots (to a total of 50) in the storage layout for future upgrades.
     */
    uint256[49] public __gap;

    /**
     * @notice Contract version number (major).
     */
    uint256 public MAJOR_VERSION;

    /**
     * @notice Contract version number (minor).
     */
    uint256 public MINOR_VERSION;

    /**
     * @notice Contract version number (patch).
     */
    uint256 public PATCH_VERSION;

    /**
     * @notice Mapping of L1 token to L2 token to ID to boolean, indicating if the given L1 token
     *         by ID was deposited for a given L2 token.
     */
    mapping(address => mapping(address => mapping(uint256 => bool))) public deposits;


}