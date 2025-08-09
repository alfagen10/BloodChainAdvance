# BloodChain - Advanced Blockchain Blood Donation Platform

## Overview

BloodChain is a comprehensive blockchain-powered blood donation platform that revolutionizes the blood donation ecosystem through smart contracts, NFT certificates, and AI-driven analytics. The platform combines a modern React frontend with an Express.js backend, utilizing PostgreSQL for data persistence and Ethereum-compatible smart contracts for transparent, incentivized donations.

The system provides secure donor registration, donation tracking, tokenized rewards, NFT certificates for donations, real-time analytics, and blood supply management. It features Web3 integration with MetaMask wallet support and multi-network compatibility (Polygon Mumbai, Polygon Mainnet, Sepolia).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build system
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom gradient themes and glass morphism effects
- **State Management**: TanStack Query for server state and React Context for Web3 state
- **Routing**: Wouter for lightweight client-side routing
- **Web3 Integration**: Ethers.js v6 for blockchain interactions with MetaMask wallet support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations with UUID primary keys and timestamp tracking
- **API Design**: RESTful endpoints for donors, donations, NFT certificates, and analytics
- **Development Tools**: Vite middleware integration for hot reloading in development

### Smart Contract Architecture
- **Development Framework**: Hardhat with OpenZeppelin upgradeable contracts
- **Contract Structure**: 
  - BloodDonation (main contract for donation logic)
  - BloodToken (ERC-20 reward token)
  - DonationNFT (ERC-721 certificates)
- **Network Support**: Multi-chain deployment (Polygon Mumbai testnet, Polygon Mainnet, Sepolia)
- **Upgradeability**: OpenZeppelin proxy pattern for contract upgrades

### Data Layer
- **Database Schema**: PostgreSQL with tables for donors, donations, NFT certificates, and blood supply tracking
- **Type Safety**: Drizzle-Zod integration for runtime validation and TypeScript inference
- **Data Relationships**: Foreign key constraints linking donors to donations and NFT certificates
- **Analytics**: Built-in aggregation queries for metrics, blood type distribution, and location statistics

### Security & Authentication
- **Wallet-Based Authentication**: Ethereum wallet signatures for user verification
- **Data Validation**: Zod schemas for input validation on both client and server
- **Smart Contract Security**: OpenZeppelin libraries and role-based access control
- **Network Security**: Environment-based configuration for sensitive contract addresses and RPC URLs

## External Dependencies

### Blockchain Infrastructure
- **Ethereum Networks**: Polygon Mumbai (testnet), Polygon Mainnet, Sepolia testnet
- **RPC Providers**: Configurable RPC endpoints for blockchain connectivity
- **Block Explorers**: Polygonscan and Etherscan integration for transaction verification
- **Wallet Integration**: MetaMask browser extension for user wallet management

### Database Services
- **PostgreSQL**: Primary database with Neon serverless PostgreSQL adapter
- **Connection Pooling**: pg-simple session store for connection management
- **Migration System**: Drizzle-kit for database schema migrations

### External APIs & Services
- **IPFS Integration**: Planned for NFT metadata and image storage
- **Gas Price APIs**: CoinMarketCap integration for gas reporting
- **Oracle Services**: Placeholder for real-world data feeds (blood bank inventory, hospital data)

### Development & Deployment
- **Package Management**: npm with TypeScript compilation
- **Build System**: Vite for frontend bundling, esbuild for backend production builds
- **Development Environment**: Replit integration with development banner and error overlay
- **Monitoring**: Custom logging middleware for API request tracking

### UI & Styling Dependencies
- **Component Library**: Radix UI primitives for accessible components
- **Animation**: Tailwind CSS animations with custom gradient and glow effects
- **Icons**: Lucide React icon library
- **Typography**: Inter font family via Google Fonts
- **Form Handling**: React Hook Form with Hookform resolvers for validation