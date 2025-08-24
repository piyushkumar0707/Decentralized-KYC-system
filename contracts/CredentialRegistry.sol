// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IIssuerRegistry.sol";

/**
 * CredentialRegistry
 * - anchors credential hashes (bytes32)
 * - only approved issuers (via IssuerRegistry) can anchor/revoke
 * - stores issuedAt, revoked flag and revokedAt
 */
contract CredentialRegistry {
    IIssuerRegistry public immutable issuerRegistry;

    struct Credential {
        address issuer;
        uint64 issuedAt;
        bool revoked;
        uint64 revokedAt;
    }

    mapping(bytes32 => Credential) private credentials;

    event CredentialAnchored(
        bytes32 indexed vcHash, 
        address indexed issuer, 
        uint256 timestamp
        );

    event CredentialRevoked(
        bytes32 indexed vcHash, 
        address indexed issuer, 
        uint256 timestamp
        );

    error NotAuthorizedIssuer();
    error AlreadyAnchored();
    error NotAnchored();
    error AlreadyRevoked();
    error OnlyOriginalIssuer();

    constructor(address issuerRegistryAddr){
        require(issuerRegistryAddr != address(0), "issuerRegistry required");
        issuerRegistry = IIssuerRegistry(issuerRegistryAddr);
    }

    modifier onlyIssuer() {
        if (!issuerRegistry.isIssuer(msg.sender)) revert NotAuthorizedIssuer();
        _;
    }

    function anchorCredential(bytes32 vcHash) external onlyIssuer {
        Credential storage rec = credentials[vcHash];
        if (rec.issuedAt != 0) revert AlreadyAnchored();
        rec.issuer = msg.sender;
        rec.issuedAt = uint64(block.timestamp);
        emit CredentialAnchored(vcHash, msg.sender, block.timestamp);
    }

    function revokeCredential(bytes32 vcHash) external onlyIssuer {
        Credential storage rec = credentials[vcHash];
        if (rec.issuedAt == 0) revert NotAnchored();
        if (rec.revoked) revert AlreadyRevoked();
        if (rec.issuer != msg.sender) revert OnlyOriginalIssuer();
        rec.revoked = true;
        rec.revokedAt = uint64(block.timestamp);
        emit CredentialRevoked(vcHash, msg.sender, block.timestamp);
    }

    function isRevoked(bytes32 vcHash) external view returns (bool) {
        return credentials[vcHash].revoked;
    }

    function getRecord(bytes32 vcHash) external view returns (address issuer, uint64 issuedAt, bool revoked, uint64 revokedAt) {
        Credential memory rec = credentials[vcHash];
        return (rec.issuer, rec.issuedAt, rec.revoked, rec.revokedAt);
    }
}
