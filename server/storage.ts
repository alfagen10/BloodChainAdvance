import {
  type Donor,
  type InsertDonor,
  type Donation,
  type InsertDonation,
  type NFTCertificate,
  type InsertNFTCertificate,
  type BloodSupply,
  type InsertBloodSupply,
  type SmartContractEvent,
  type TokenTransaction,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Donor operations
  getDonor(id: string): Promise<Donor | undefined>;
  getDonorByWallet(walletAddress: string): Promise<Donor | undefined>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonorPoints(walletAddress: string, points: number): Promise<void>;
  getAllDonors(): Promise<Donor[]>;

  // Donation operations
  getDonation(id: string): Promise<Donation | undefined>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByDonor(donorId: string): Promise<Donation[]>;
  getAllDonations(): Promise<Donation[]>;
  
  // NFT Certificate operations
  getNFTCertificate(tokenId: string): Promise<NFTCertificate | undefined>;
  createNFTCertificate(certificate: InsertNFTCertificate): Promise<NFTCertificate>;
  getNFTsByDonor(donorAddress: string): Promise<NFTCertificate[]>;
  getAllNFTCertificates(): Promise<NFTCertificate[]>;

  // Blood supply operations
  getBloodSupply(location: string, bloodType: string): Promise<BloodSupply | undefined>;
  updateBloodSupply(supply: InsertBloodSupply): Promise<BloodSupply>;
  getAllBloodSupply(): Promise<BloodSupply[]>;
  
  // Analytics operations
  getDonationMetrics(): Promise<{
    totalDonations: number;
    totalDonors: number;
    totalUnits: number;
    totalTokensDistributed: number;
    totalNFTsMinted: number;
  }>;
  
  getBloodTypeDistribution(): Promise<Array<{ bloodType: string; count: number; percentage: number }>>;
  getLocationStats(): Promise<Array<{ location: string; donations: number; donors: number }>>;
  
  // Blockchain event operations
  logContractEvent(event: Omit<SmartContractEvent, "id" | "processedAt">): Promise<void>;
  getContractEvents(limit?: number): Promise<SmartContractEvent[]>;
  
  // Token transaction operations
  logTokenTransaction(transaction: Omit<TokenTransaction, "id" | "timestamp">): Promise<void>;
  getTokenTransactions(address?: string, limit?: number): Promise<TokenTransaction[]>;
}

export class MemStorage implements IStorage {
  private donors: Map<string, Donor> = new Map();
  private donations: Map<string, Donation> = new Map();
  private nftCertificates: Map<string, NFTCertificate> = new Map();
  private bloodSupply: Map<string, BloodSupply> = new Map();
  private contractEvents: SmartContractEvent[] = [];
  private tokenTransactions: TokenTransaction[] = [];

  // Donor operations
  async getDonor(id: string): Promise<Donor | undefined> {
    return this.donors.get(id);
  }

  async getDonorByWallet(walletAddress: string): Promise<Donor | undefined> {
    return Array.from(this.donors.values()).find(
      (donor) => donor.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    const id = randomUUID();
    const donor: Donor = {
      ...insertDonor,
      id,
      rewardPoints: 0,
      totalDonations: 0,
      isVerified: false,
      registeredAt: new Date(),
    };
    this.donors.set(id, donor);
    return donor;
  }

  async updateDonorPoints(walletAddress: string, points: number): Promise<void> {
    const donor = await this.getDonorByWallet(walletAddress);
    if (donor) {
      donor.rewardPoints = (donor.rewardPoints || 0) + points;
      donor.totalDonations = (donor.totalDonations || 0) + 1;
      this.donors.set(donor.id, donor);
    }
  }

  async getAllDonors(): Promise<Donor[]> {
    return Array.from(this.donors.values());
  }

  // Donation operations
  async getDonation(id: string): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = randomUUID();
    const donation: Donation = {
      bloodType: insertDonation.bloodType,
      quantity: insertDonation.quantity,
      hospital: insertDonation.hospital,
      location: insertDonation.location,
      donorId: insertDonation.donorId || null,
      transactionHash: insertDonation.transactionHash || null,
      blockNumber: insertDonation.blockNumber || null,
      nftTokenId: insertDonation.nftTokenId || null,
      rewardTokens: insertDonation.rewardTokens || null,
      id,
      donatedAt: new Date(),
    };
    this.donations.set(id, donation);
    return donation;
  }

  async getDonationsByDonor(donorId: string): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(
      (donation) => donation.donorId === donorId
    );
  }

  async getAllDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values()).sort(
      (a, b) => new Date(b.donatedAt!).getTime() - new Date(a.donatedAt!).getTime()
    );
  }

  // NFT Certificate operations
  async getNFTCertificate(tokenId: string): Promise<NFTCertificate | undefined> {
    return this.nftCertificates.get(tokenId);
  }

  async createNFTCertificate(insertCertificate: InsertNFTCertificate): Promise<NFTCertificate> {
    const id = randomUUID();
    const certificate: NFTCertificate = {
      tokenId: insertCertificate.tokenId,
      donorAddress: insertCertificate.donorAddress,
      transactionHash: insertCertificate.transactionHash || null,
      donationId: insertCertificate.donationId || null,
      metadataUri: insertCertificate.metadataUri || null,
      imageUri: insertCertificate.imageUri || null,
      id,
      mintedAt: new Date(),
    };
    this.nftCertificates.set(certificate.tokenId, certificate);
    return certificate;
  }

  async getNFTsByDonor(donorAddress: string): Promise<NFTCertificate[]> {
    return Array.from(this.nftCertificates.values()).filter(
      (nft) => nft.donorAddress.toLowerCase() === donorAddress.toLowerCase()
    );
  }

  async getAllNFTCertificates(): Promise<NFTCertificate[]> {
    return Array.from(this.nftCertificates.values()).sort(
      (a, b) => new Date(b.mintedAt!).getTime() - new Date(a.mintedAt!).getTime()
    );
  }

  // Blood supply operations
  async getBloodSupply(location: string, bloodType: string): Promise<BloodSupply | undefined> {
    const key = `${location}-${bloodType}`;
    return this.bloodSupply.get(key);
  }

  async updateBloodSupply(insertSupply: InsertBloodSupply): Promise<BloodSupply> {
    const id = randomUUID();
    const key = `${insertSupply.location}-${insertSupply.bloodType}`;
    const supply: BloodSupply = {
      bloodType: insertSupply.bloodType,
      location: insertSupply.location,
      currentStock: insertSupply.currentStock || null,
      minimumThreshold: insertSupply.minimumThreshold || null,
      shortageRisk: insertSupply.shortageRisk || null,
      id,
      lastUpdated: new Date(),
    };
    this.bloodSupply.set(key, supply);
    return supply;
  }

  async getAllBloodSupply(): Promise<BloodSupply[]> {
    return Array.from(this.bloodSupply.values());
  }

  // Analytics operations
  async getDonationMetrics() {
    const donations = await this.getAllDonations();
    const donors = await this.getAllDonors();
    const nfts = await this.getAllNFTCertificates();

    const totalUnits = donations.reduce((sum, donation) => sum + donation.quantity, 0);
    const totalTokensDistributed = donations.reduce(
      (sum, donation) => sum + parseFloat(donation.rewardTokens || "0"),
      0
    );

    return {
      totalDonations: donations.length,
      totalDonors: donors.length,
      totalUnits,
      totalTokensDistributed,
      totalNFTsMinted: nfts.length,
    };
  }

  async getBloodTypeDistribution() {
    const donations = await this.getAllDonations();
    const distribution = new Map<string, number>();

    donations.forEach((donation) => {
      const count = distribution.get(donation.bloodType) || 0;
      distribution.set(donation.bloodType, count + 1);
    });

    const total = donations.length;
    return Array.from(distribution.entries()).map(([bloodType, count]) => ({
      bloodType,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }

  async getLocationStats() {
    const donations = await this.getAllDonations();
    const donors = await this.getAllDonors();
    const locationDonations = new Map<string, number>();
    const locationDonors = new Map<string, Set<string>>();

    donations.forEach((donation) => {
      const count = locationDonations.get(donation.location) || 0;
      locationDonations.set(donation.location, count + 1);
    });

    donors.forEach((donor) => {
      if (!locationDonors.has(donor.location)) {
        locationDonors.set(donor.location, new Set());
      }
      locationDonors.get(donor.location)!.add(donor.id);
    });

    return Array.from(locationDonations.entries()).map(([location, donationCount]) => ({
      location,
      donations: donationCount,
      donors: locationDonors.get(location)?.size || 0,
    }));
  }

  // Blockchain event operations
  async logContractEvent(event: Omit<SmartContractEvent, "id" | "processedAt">): Promise<void> {
    const contractEvent: SmartContractEvent = {
      ...event,
      id: randomUUID(),
      processedAt: new Date(),
    };
    this.contractEvents.unshift(contractEvent);
    
    // Keep only the last 1000 events
    if (this.contractEvents.length > 1000) {
      this.contractEvents = this.contractEvents.slice(0, 1000);
    }
  }

  async getContractEvents(limit = 50): Promise<SmartContractEvent[]> {
    return this.contractEvents.slice(0, limit);
  }

  // Token transaction operations
  async logTokenTransaction(transaction: Omit<TokenTransaction, "id" | "timestamp">): Promise<void> {
    const tokenTransaction: TokenTransaction = {
      ...transaction,
      id: randomUUID(),
      timestamp: new Date(),
    };
    this.tokenTransactions.unshift(tokenTransaction);
    
    // Keep only the last 1000 transactions
    if (this.tokenTransactions.length > 1000) {
      this.tokenTransactions = this.tokenTransactions.slice(0, 1000);
    }
  }

  async getTokenTransactions(address?: string, limit = 50): Promise<TokenTransaction[]> {
    let transactions = this.tokenTransactions;
    
    if (address) {
      transactions = transactions.filter(
        (tx) =>
          tx.fromAddress?.toLowerCase() === address.toLowerCase() ||
          tx.toAddress.toLowerCase() === address.toLowerCase()
      );
    }
    
    return transactions.slice(0, limit);
  }
}

export const storage = new MemStorage();
