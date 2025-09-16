# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

This is a Decentralized KYC (Know Your Customer) system built on Ethereum using Hardhat for smart contract development, Express.js for the backend API, and React for the frontend. The system implements a blockchain-based identity verification platform with Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs).

## Development Commands

### Smart Contract Development
```bash
# Compile all Solidity contracts
npm run compile

# Run Hardhat tests
npm run test

# Start local Hardhat node for development
npm run node

# Deploy contracts to local network
npm run deploy:local

# Run specific test file
npx hardhat test tests/kyc.flow.test.js

# Clean Hardhat artifacts and cache
npx hardhat clean
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start backend server with nodemon (auto-reload)
npm start

# Backend runs on port specified in .env (copy from .env.example)
```

### Frontend Development
```bash
# Navigate to React frontend
cd frontend-cra

# Install dependencies
npm install

# Start development server
npm start
# Runs on http://localhost:3000

# Build for production
npm run build

# Run React tests
npm test
```

## Architecture Overview

### Smart Contract Layer (Ethereum/Polygon)
The system consists of three main smart contracts working together:

- **IssuerRegistry.sol**: OpenZeppelin AccessControl-based registry that manages approved issuers who can create/revoke credentials. Uses role-based permissions with DEFAULT_ADMIN_ROLE and ISSUER_ROLE.

- **DIDRegistry.sol**: Manages Decentralized Identifiers (DIDs) for users. Supports user self-registration, issuer-based DID creation, self-revocation, and issuer-based revocation with reasons (Fraud, Expired, Regulatory).

- **CredentialRegistry.sol**: Anchors credential hashes (bytes32) on-chain with issuance/revocation timestamps. Only approved issuers can anchor or revoke credentials. Stores credential metadata without exposing private data.

### Backend API (Node.js/Express)
Located in `backend/` with modular route structure:
- `src/routes/audit.routes.js` - Audit trail endpoints
- `src/routes/user.routes.js` - User management
- `src/routes/did.routes.js` - DID operations  
- `src/routes/kyc.routes.js` - KYC workflow endpoints
- `src/routes/vc.routes.js` - Verifiable Credential operations

Key features:
- Webhook verification middleware with signature validation
- MongoDB integration for off-chain data storage
- IPFS integration via Pinata for document storage
- JWT authentication with access/refresh tokens
- Blockchain interaction via ethers.js
- Environment configuration via dotenv

### Frontend (React CRA)
- Located in `frontend-cra/`
- Uses Tailwind CSS for styling with shadcn/ui components
- React Router for navigation
- Lucide React for icons

### Deployment & Configuration
- Hardhat configuration supports local development and Polygon mainnet
- Contract addresses tracked in `migrationsDeployment/deployments.json`
- Environment variables defined in `backend/.env.example`
- Separate deployment scripts in `migrationsDeployment/` directory

### Development Workflow
1. Start local Hardhat node: `npm run node`
2. Deploy contracts locally: `npm run deploy:local` 
3. Start backend API: `cd backend && npm start`
4. Start React frontend: `cd frontend-cra && npm start`
5. Update contract addresses in deployments.json after deployment

### Testing
- Smart contract tests in `tests/` directory using Hardhat/Waffle
- End-to-end KYC flow testing in `tests/kyc.flow.test.js`
- React component tests using React Testing Library
- Backend API can be tested against the health endpoint: `/health`

### Key Dependencies
- **Blockchain**: Hardhat, ethers.js, OpenZeppelin contracts
- **Backend**: Express, MongoDB/Mongoose, Pinata SDK, JWT, bcrypt  
- **Frontend**: React 19, React Router, Tailwind CSS, shadcn/ui
- **Development**: nodemon, dotenv, morgan logging

## Environment Setup
1. Copy `backend/.env.example` to `backend/.env` and configure:
   - MongoDB connection
   - Pinata IPFS credentials  
   - JWT secrets
   - Blockchain RPC URL and private key
   - CORS origins

2. Ensure you have a local Hardhat node running or access to Polygon network
3. Deploy contracts and update `migrationsDeployment/deployments.json` with deployed addresses

## Common Issues and Troubleshooting

### Smart Contract Development
- If having issues with contract compilation, try clearing the cache with `npx hardhat clean`
- For contract verification issues, check that you're using the correct Solidity version (0.8.30)
- When testing with Hardhat, ensure you're using the correct network configuration in hardhat.config.cjs

### Backend Development
- JWT token validation failures often relate to mismatched secrets in .env
- For IPFS storage issues, verify Pinata API keys and credentials
- MongoDB connection issues can be debugged by checking the connection string format

### Frontend Development
- MetaMask connectivity problems can be addressed by checking the network configuration
- If contract interactions fail, verify that the contract ABI and addresses match deployed contracts
- For styling issues, make sure Tailwind configuration is properly set up

## Blockchain Integration
- The codebase is set up to work with Polygon Mainnet (chainId 137) or Mumbai Testnet (chainId 80001)
- For local development, use Hardhat network (chainId 31337)
- Contract interactions use ethers.js wrapper functions found in `backend/src/config/blockchain.js` and `frontend-cra/src/lib/ethereum.js`
- When testing locally, the contracts expect a running Hardhat node on the default port (8545)
- Contract deployment addresses are tracked in `migrationsDeployment/contracts.json`

## Issue Resolution Reference
For detailed analysis of common issues and their fixes, see `FRONTEND_ISSUES_AND_FIXES.md` which documents:
- JavaScript syntax errors and their corrections
- Missing configuration files and deployment setup
- Service management and port conflict resolution
- Complete before/after comparison with technical explanations
