import { ethers } from 'ethers';

export interface BlockchainMetrics {
  totalDonations: number;
  totalDonors: number;
  totalUnits: number;
  totalTokensDistributed: number;
  totalNFTsMinted: number;
}

export interface BloodTypeStats {
  bloodType: string;
  count: number;
  percentage: number;
  shortageRisk: number;
}

export interface LocationStats {
  location: string;
  donations: number;
  donors: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface TransactionDetails {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  timestamp: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Generate NFT metadata for donation certificates
export function generateNFTMetadata(
  donorName: string,
  bloodType: string,
  quantity: number,
  hospital: string,
  donationDate: Date
): NFTMetadata {
  return {
    name: `BloodChain Donation Certificate #${Date.now()}`,
    description: `Official donation certificate for ${quantity} units of ${bloodType} blood donated by ${donorName} at ${hospital}.`,
    image: generateCertificateImageURI(donorName, bloodType, quantity, hospital, donationDate),
    attributes: [
      {
        trait_type: "Donor Name",
        value: donorName
      },
      {
        trait_type: "Blood Type",
        value: bloodType
      },
      {
        trait_type: "Quantity",
        value: quantity
      },
      {
        trait_type: "Hospital",
        value: hospital
      },
      {
        trait_type: "Donation Date",
        value: donationDate.toISOString().split('T')[0]
      },
      {
        trait_type: "Certificate Type",
        value: "Blood Donation"
      }
    ]
  };
}

// Generate certificate image URI (for demo purposes, using a placeholder service)
function generateCertificateImageURI(
  donorName: string,
  bloodType: string,
  quantity: number,
  hospital: string,
  donationDate: Date
): string {
  // In a real implementation, this would generate or retrieve an actual certificate image
  // For demo purposes, we'll use a placeholder image service
  const baseUrl = "https://images.unsplash.com/photo-1584515933487-779824d29309";
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: "800",
    h: "600",
    q: "80"
  });
  
  return `${baseUrl}?${params.toString()}`;
}

// Calculate shortage risk based on current stock and historical data
export function calculateShortageRisk(
  currentStock: number,
  averageConsumption: number,
  minimumThreshold: number
): number {
  const daysOfSupply = currentStock / (averageConsumption || 1);
  const thresholdRatio = currentStock / minimumThreshold;
  
  if (daysOfSupply < 3 || thresholdRatio < 0.5) {
    return 0.8; // High risk
  } else if (daysOfSupply < 7 || thresholdRatio < 0.8) {
    return 0.5; // Medium risk
  } else {
    return 0.2; // Low risk
  }
}

// Format blockchain addresses for display
export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Format token amounts for display
export function formatTokenAmount(amount: string | number, decimals = 18, precision = 2): string {
  try {
    const formatted = ethers.formatUnits(amount.toString(), decimals);
    return parseFloat(formatted).toFixed(precision);
  } catch {
    return '0.00';
  }
}

// Parse token amounts from input
export function parseTokenAmount(amount: string, decimals = 18): string {
  try {
    return ethers.parseUnits(amount, decimals).toString();
  } catch {
    return '0';
  }
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

// Generate QR code data for donation verification
export function generateDonationQRData(
  donorAddress: string,
  transactionHash: string,
  tokenId?: string
): string {
  const data = {
    donor: donorAddress,
    tx: transactionHash,
    ...(tokenId && { nft: tokenId }),
    platform: 'BloodChain',
    timestamp: Date.now()
  };
  
  return JSON.stringify(data);
}

// Calculate gas price in readable format
export function formatGasPrice(gasPrice: bigint): string {
  const gwei = ethers.formatUnits(gasPrice, 'gwei');
  return `${parseFloat(gwei).toFixed(2)} gwei`;
}

// Estimate transaction cost
export function estimateTransactionCost(gasLimit: number, gasPrice: bigint): string {
  const cost = gasPrice * BigInt(gasLimit);
  return ethers.formatEther(cost);
}

// Get transaction status message
export function getTransactionStatusMessage(receipt: ethers.TransactionReceipt): string {
  if (receipt.status === 1) {
    return 'Transaction successful';
  } else {
    return 'Transaction failed';
  }
}

// Mock data generators for demo purposes
export function generateMockMetrics(): BlockchainMetrics {
  return {
    totalDonations: Math.floor(Math.random() * 3000) + 2000,
    totalDonors: Math.floor(Math.random() * 5000) + 4000,
    totalUnits: Math.floor(Math.random() * 10000) + 8000,
    totalTokensDistributed: Math.floor(Math.random() * 150000) + 100000,
    totalNFTsMinted: Math.floor(Math.random() * 2500) + 1500,
  };
}

export function generateMockBloodTypeStats(): BloodTypeStats[] {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  return bloodTypes.map(bloodType => ({
    bloodType,
    count: Math.floor(Math.random() * 500) + 100,
    percentage: Math.random() * 20 + 5,
    shortageRisk: Math.random() * 0.8,
  }));
}

export function generateMockLocationStats(): LocationStats[] {
  const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
  
  return locations.map(location => ({
    location,
    donations: Math.floor(Math.random() * 800) + 200,
    donors: Math.floor(Math.random() * 1200) + 300,
    riskLevel: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)],
  }));
}
