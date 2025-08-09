import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const donors = pgTable("donors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  name: text("name").notNull(),
  bloodType: text("blood_type").notNull(),
  location: text("location").notNull(),
  rewardPoints: integer("reward_points").default(0),
  totalDonations: integer("total_donations").default(0),
  isVerified: boolean("is_verified").default(false),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorId: varchar("donor_id").references(() => donors.id),
  bloodType: text("blood_type").notNull(),
  quantity: integer("quantity").notNull(),
  hospital: text("hospital").notNull(),
  location: text("location").notNull(),
  transactionHash: text("transaction_hash"),
  blockNumber: integer("block_number"),
  nftTokenId: text("nft_token_id"),
  rewardTokens: decimal("reward_tokens", { precision: 18, scale: 8 }),
  donatedAt: timestamp("donated_at").defaultNow(),
});

export const nftCertificates = pgTable("nft_certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tokenId: text("token_id").notNull().unique(),
  donationId: varchar("donation_id").references(() => donations.id),
  donorAddress: text("donor_address").notNull(),
  metadataUri: text("metadata_uri"),
  imageUri: text("image_uri"),
  transactionHash: text("transaction_hash"),
  mintedAt: timestamp("minted_at").defaultNow(),
});

export const bloodSupply = pgTable("blood_supply", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  location: text("location").notNull(),
  bloodType: text("blood_type").notNull(),
  currentStock: integer("current_stock").default(0),
  minimumThreshold: integer("minimum_threshold").default(10),
  shortageRisk: decimal("shortage_risk", { precision: 5, scale: 4 }).default("0.0000"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const smartContractEvents = pgTable("smart_contract_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  contractAddress: text("contract_address").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  blockNumber: integer("block_number").notNull(),
  eventData: text("event_data"), // JSON string
  processedAt: timestamp("processed_at").defaultNow(),
});

export const tokenTransactions = pgTable("token_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromAddress: text("from_address"),
  toAddress: text("to_address").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  transactionType: text("transaction_type").notNull(), // mint, transfer, burn
  transactionHash: text("transaction_hash").notNull(),
  blockNumber: integer("block_number").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertDonorSchema = createInsertSchema(donors).omit({
  id: true,
  registeredAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  donatedAt: true,
});

export const insertNFTCertificateSchema = createInsertSchema(nftCertificates).omit({
  id: true,
  mintedAt: true,
});

export const insertBloodSupplySchema = createInsertSchema(bloodSupply).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type Donor = typeof donors.$inferSelect;
export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type NFTCertificate = typeof nftCertificates.$inferSelect;
export type InsertNFTCertificate = z.infer<typeof insertNFTCertificateSchema>;
export type BloodSupply = typeof bloodSupply.$inferSelect;
export type InsertBloodSupply = z.infer<typeof insertBloodSupplySchema>;
export type SmartContractEvent = typeof smartContractEvents.$inferSelect;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;

// Blood types enum
export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodType = typeof BLOOD_TYPES[number];

// Contract addresses (will be set after deployment)
export const CONTRACT_ADDRESSES = {
  BLOOD_DONATION: process.env.BLOOD_DONATION_CONTRACT || "",
  BLOOD_TOKEN: process.env.BLOOD_TOKEN_CONTRACT || "",
  DONATION_NFT: process.env.DONATION_NFT_CONTRACT || "",
} as const;
