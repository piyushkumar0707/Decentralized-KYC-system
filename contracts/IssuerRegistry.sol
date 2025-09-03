//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IssuerRegistry
 * @notice Admin-managed allowlist of issuer addresses.
 *         Uses AccessControl:
 *           - DEFAULT_ADMIN_ROLE: can add/remove ISSUER_ROLE and new admins.
 *           - ISSUER_ROLE: addresses allowed to anchor/revoke credentials.
 */

 contract IssuerRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    event IssuerAdded(
        address indexed issuer , 
        address indexed admin
        );

    event IssuerRemoved(
        address indexed issuer, 
        address indexed admin
        );

    constructor(address initialAdmin){
        require(initialAdmin != address(0) , "initial admin required");
        _grantRole(DEFAULT_ADMIN_ROLE , initialAdmin);
    }

    function addIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE){
        _grantRole(ISSUER_ROLE , issuer);
        emit IssuerAdded(issuer , msg.sender);
    }

    function removeIssuer(address issuer ) external onlyRole(DEFAULT_ADMIN_ROLE){
        _revokeRole(ISSUER_ROLE , issuer);
        emit IssuerRemoved(issuer , msg.sender);
    }

    function isIssuer(address account) external view returns(bool){
        return hasRole(ISSUER_ROLE , account);
    }
 }
