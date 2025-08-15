// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

   contract DIDRegistry{

mapping(address => string) private _didOf;

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
    string lastDidURI
);

modifier onlyDidOwner(string memory _did)

function registerDID(string calldata _didURI)erternal{
      require(bytes(didURI).length > 0, "DID URI required");
      string memory old = _didOf[msg.sender];
      _didOf[msg.sender] = didURI;

      if(bytes(old).length == 0){
        emit DIDRegistered(msg.sender , didURI);
      } else {
        emit DIDUpdate(msg.sender , old , didURI);
      }
}
     function revokeDID() external{
        string memory old = _didOf[msg.sender];
        require(bytes(old).length != 0 , "No DID");
        delete _didOf[msg.sender];
        emit DIDRevoked(msg.sender , old);
     }
     function getDID(address owner) external view retuens(string memory){
        return _didOf[owner];
     }
   }