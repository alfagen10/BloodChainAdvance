import { ethers } from 'ethers';

// Contract addresses (deployed on Polygon Amoy Testnet)
export const CONTRACT_ADDRESSES = {
  BLOOD_DONATION: import.meta.env.VITE_BLOOD_DONATION_CONTRACT || "0x742d35Cc6B5C4532845C5B5C4532845C5B5C7B2e",
  BLOOD_TOKEN: import.meta.env.VITE_BLOOD_TOKEN_CONTRACT || "0x4B2e4CBe091E687729274D33dd8D7911e3d86d9C",
  DONATION_NFT: import.meta.env.VITE_DONATION_NFT_CONTRACT || "0x58bb59c3aF6a504EAf6F78AbdDB8711F8a5bcfDe",
} as const;

// Polygon Amoy Testnet configuration
export const AMOY_CONFIG = {
  chainId: 80002,
  name: 'Polygon Amoy Testnet',
  rpcUrl: 'https://rpc-amoy.polygon.technology/',
  blockExplorer: 'https://www.oklink.com/amoy/',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
};

// Contract ABIs (simplified for demo)
export const BLOOD_DONATION_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_bloodType", "type": "string"},
      {"internalType": "uint256", "name": "_quantity", "type": "uint256"},
      {"internalType": "string", "name": "_hospital", "type": "string"}
    ],
    "name": "logDonation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_donor", "type": "address"},
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_bloodType", "type": "string"}
    ],
    "name": "registerDonor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "donors",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "bloodType", "type": "string"},
      {"internalType": "uint256", "name": "totalDonations", "type": "uint256"},
      {"internalType": "bool", "name": "isRegistered", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "donor", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "bloodType", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "quantity", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "hospital", "type": "string"}
    ],
    "name": "DonationLogged",
    "type": "event"
  }
];

export const BLOOD_TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const DONATION_NFT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "tokenURI", "type": "string"}
    ],
    "name": "mint",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "index", "type": "uint256"}
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Utility functions for Web3 operations
export function formatTokenAmount(amount: string | number, decimals = 18): string {
  return ethers.formatUnits(amount.toString(), decimals);
}

export function parseTokenAmount(amount: string, decimals = 18): bigint {
  return ethers.parseUnits(amount, decimals);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getBlockExplorerUrl(txHash: string): string {
  return `${AMOY_CONFIG.blockExplorer}/tx/${txHash}`;
}

export function getAddressExplorerUrl(address: string): string {
  return `${AMOY_CONFIG.blockExplorer}/address/${address}`;
}
