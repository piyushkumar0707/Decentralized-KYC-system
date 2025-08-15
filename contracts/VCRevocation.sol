// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IIssuerRegistry.sol";

/**
 * @title VCRevocation
 * @notice Anchors a VC hash (bytes32) and supports revocation.
 *         Only approved issuers (from IssuerRegistry) can anchor/revoke.
 *         Stores no PII; only hashes + flags + timestamps.
 */

 contract VCRevocation{
    IIsuerRegistry public immutable issuerRegistry;

    struct VCRecord {
        address issuer;
        uint64 issuedAt;
        bool revoked;
        uint64 revokedAt;
    }
    // vcHash => VCRecord
    mapping(bytes32 => VCRecord) private _vc;

    event CredentialAnchored(
        bytes32 indexed vcHash,
        address indexed issuer,
        uint256 timestamps
        );

    event CredentialRevoked(
        bytes32 indexed vcHash , 
        address indexed issuer , 
        uint256 , timestamps
        );

        error NotAuthorizedIssuer();
        error AlreadyAnchored();
        error NotAnchored();
        error AlreadyRevoked();

        constructor(address issuerRegistryAddr){
            require(issuerRegistryAddr != address(0) , "Issuer registry required");
            issuerRegistry = IIsuerRegistry(issuerRegistryAddr);
        }
        modifier onlyIssuer(){
            if(!idduerRegistry.isIssuer(msg.sender)) revert NotAuthoriziationIssuer();
            _;
        }
      /**
     * @notice Anchor a VC hash. One-time. Emits CredentialAnchored.
     * @param vcHash Keccak-256 (or other) hash of the VC JSON (or normalized payload).
     */

fucntion anchorCredential(bytes32 vcHash) external onlyIssuer{
    VCRecord storage rec = _vc[vcHash];
    if (rec.issuedAt == 0) revert NotAnchored();
    if (rec.revoked) revert AlreadyRevoked();

    //policy option A (strict) : only original issuer can revoke
    require(rec.issuer == msg.sender , "Only issuer who anchored can revoke ");

    rec.revoked = true;
    rec.revokedAt = uint64(block.timestamp);

    emit CredentialRevoked(vcHash , msg.sender , block.timestamp);
} 
 /**
     * @notice Query revocation status.
     */

     function isRevoked(bytes32 vcHash) external view returns (bool){
        return _vc[vcHash].revoked;
     }
    /**
     * @notice Get full record for off-chain indexers.
     */

     function getRecord(bytes32 vcHash) external view returns(VCRecord memory){
        return _vc[vcHash];
     }
 }