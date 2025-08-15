// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IIssuerRegistry {
    function isIssuer(address account) external view returns (bool);
}
