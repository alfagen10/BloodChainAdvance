import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDonorSchema, insertDonationSchema, insertNFTCertificateSchema, BLOOD_TYPES } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Donor routes
  app.post("/api/donors", async (req, res) => {
    try {
      const donorData = insertDonorSchema.parse(req.body);
      
      // Check if donor already exists
      const existingDonor = await storage.getDonorByWallet(donorData.walletAddress);
      if (existingDonor) {
        return res.status(400).json({ error: "Donor already registered with this wallet address" });
      }
      
      const donor = await storage.createDonor(donorData);
      res.json(donor);
    } catch (error) {
      res.status(400).json({ error: "Invalid donor data", details: error });
    }
  });

  app.get("/api/donors", async (req, res) => {
    try {
      const donors = await storage.getAllDonors();
      res.json(donors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donors" });
    }
  });

  app.get("/api/donors/wallet/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const donor = await storage.getDonorByWallet(address);
      if (!donor) {
        return res.status(404).json({ error: "Donor not found" });
      }
      res.json(donor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donor" });
    }
  });

  // Donation routes
  app.post("/api/donations", async (req, res) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      
      // Validate blood type
      if (!BLOOD_TYPES.includes(donationData.bloodType as any)) {
        return res.status(400).json({ error: "Invalid blood type" });
      }
      
      const donation = await storage.createDonation(donationData);
      
      // Update donor points if donor exists
      if (donation.donorId) {
        const donor = await storage.getDonor(donation.donorId);
        if (donor) {
          await storage.updateDonorPoints(donor.walletAddress, donation.quantity * 10);
        }
      }
      
      res.json(donation);
    } catch (error) {
      res.status(400).json({ error: "Invalid donation data", details: error });
    }
  });

  app.get("/api/donations", async (req, res) => {
    try {
      const donations = await storage.getAllDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  });

  app.get("/api/donations/donor/:donorId", async (req, res) => {
    try {
      const { donorId } = req.params;
      const donations = await storage.getDonationsByDonor(donorId);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donor donations" });
    }
  });

  // NFT Certificate routes
  app.post("/api/nft-certificates", async (req, res) => {
    try {
      const certificateData = insertNFTCertificateSchema.parse(req.body);
      const certificate = await storage.createNFTCertificate(certificateData);
      res.json(certificate);
    } catch (error) {
      res.status(400).json({ error: "Invalid certificate data", details: error });
    }
  });

  app.get("/api/nft-certificates", async (req, res) => {
    try {
      const certificates = await storage.getAllNFTCertificates();
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFT certificates" });
    }
  });

  app.get("/api/nft-certificates/donor/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const certificates = await storage.getNFTsByDonor(address);
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donor NFTs" });
    }
  });

  app.get("/api/nft-certificates/:tokenId", async (req, res) => {
    try {
      const { tokenId } = req.params;
      const certificate = await storage.getNFTCertificate(tokenId);
      if (!certificate) {
        return res.status(404).json({ error: "NFT certificate not found" });
      }
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFT certificate" });
    }
  });

  // Blood supply routes
  app.get("/api/blood-supply", async (req, res) => {
    try {
      const bloodSupply = await storage.getAllBloodSupply();
      res.json(bloodSupply);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blood supply" });
    }
  });

  app.get("/api/blood-supply/:location/:bloodType", async (req, res) => {
    try {
      const { location, bloodType } = req.params;
      const supply = await storage.getBloodSupply(location, bloodType);
      if (!supply) {
        return res.status(404).json({ error: "Blood supply data not found" });
      }
      res.json(supply);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blood supply" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDonationMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.get("/api/analytics/blood-types", async (req, res) => {
    try {
      const distribution = await storage.getBloodTypeDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blood type distribution" });
    }
  });

  app.get("/api/analytics/locations", async (req, res) => {
    try {
      const locationStats = await storage.getLocationStats();
      res.json(locationStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch location statistics" });
    }
  });

  // Blockchain event routes
  app.post("/api/blockchain/events", async (req, res) => {
    try {
      const eventSchema = z.object({
        eventType: z.string(),
        contractAddress: z.string(),
        transactionHash: z.string(),
        blockNumber: z.number(),
        eventData: z.string().optional(),
      });
      
      const eventData = eventSchema.parse(req.body);
      await storage.logContractEvent({
        ...eventData,
        eventData: eventData.eventData || null,
      });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid event data", details: error });
    }
  });

  app.get("/api/blockchain/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const events = await storage.getContractEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blockchain events" });
    }
  });

  // Token transaction routes
  app.post("/api/tokens/transactions", async (req, res) => {
    try {
      const transactionSchema = z.object({
        fromAddress: z.string().optional(),
        toAddress: z.string(),
        amount: z.string(),
        transactionType: z.string(),
        transactionHash: z.string(),
        blockNumber: z.number(),
      });
      
      const transactionData = transactionSchema.parse(req.body);
      await storage.logTokenTransaction({
        ...transactionData,
        fromAddress: transactionData.fromAddress || null,
      });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data", details: error });
    }
  });

  app.get("/api/tokens/transactions", async (req, res) => {
    try {
      const address = req.query.address as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getTokenTransactions(address, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch token transactions" });
    }
  });

  // ML Prediction endpoint (placeholder for now)
  app.get("/api/predictions/shortage/:location", async (req, res) => {
    try {
      const { location } = req.params;
      
      // Simulate ML prediction based on current blood supply data
      const predictions = BLOOD_TYPES.map(bloodType => ({
        bloodType,
        shortageRisk: Math.random() * 0.8, // 0-80% risk
        confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
        recommendedStock: Math.floor(Math.random() * 20) + 10, // 10-30 units
      }));
      
      res.json({
        location,
        predictions,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate predictions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
