// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IssuerRegistry {
  function isIssuer(address account) external view returns(bool);
}

contract DIDRegistry{

   mapping(address => string) private _didOf;
   IssuerRegistry public issuerRegistry;
  
  //enum for issuer based revocation reasons
  enum RevokeReason { 
    Fraud,
    Expired,
    Regulatory
  }


  event DIDRegistered(
    address indexed owner , 
    string didURI
  );

  event DIDUpdated(
    address indexed owner , 
    string oldDidURI , 
    string newDidURI
  );

  event DIDRevoked(
    address indexed owner , 
    string lastDidURI,
    string revokedBy,
    string reason
  );

  constructor(address issuerRegistryAddr){
    issuerRegistry = IssuerRegistry(issuerRegistryAddr);
  }

  modifier onlyIssuer(){
    require(issuerRegistry.isIssuer(msg.sender), "Not an authorised issuer");
    _;
  }
 
 // user or issuer can register DID

  function registerDID(address user , string calldata _didURI)external{
      require(bytes(_didURI).length > 0, "DID URI required");
      string memory old = _didOf[user];
      _didOf[msg.sender] = _didURI; // assigning did to given user

      if(bytes(old).length == 0){
        emit DIDRegistered(user , _didURI);
      } else {
        emit DIDUpdate(msg.sender , old , _didURI);
      }
  } 

  //user revokes their own did

     function revokeDID() external{
        string memory old = _didOf[msg.sender];
        require(bytes(old).length != 0 , "No DID");
        delete _didOf[msg.sender];
        emit DIDRevoked(msg.sender , old , "User" , "User requested revocation");
     }

     // Issuer revokes user's DID with reason
      function issuerRevokeDID(address user , RevokeReason reason )external onlyIssuer{
        string memory old = _didOf[user];
        require(bytes(old).length != 0, " No DID found for user");
        delete _didOf[user];

        string memory reasonStr;
        if(reason == RevokeReason.Fraud){
          reasonStr = "Fraud detected";
        }
        else if ( reason == RevokeReason.Expired){
          reasonStr = "ID Expired";
        }
        else if ( reason == RevokeReason.Regulatory){
          reasonStr = "Regulatory request";
        }
        emit DIDRevoked(user , old , "Issuer" , reasonStr);
      }

     // View DID
     function getDID(address owner) external view returns(string memory){
        return _didOf[owner];
      }
}