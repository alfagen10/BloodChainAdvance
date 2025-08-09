const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy BloodToken first
  console.log("\n🩸 Deploying SimpleBloodToken...");
  const BloodToken = await ethers.getContractFactory("SimpleBloodToken");
  const bloodToken = await BloodToken.deploy();
  await bloodToken.waitForDeployment();
  const bloodTokenAddress = await bloodToken.getAddress();
  console.log("✅ SimpleBloodToken deployed to:", bloodTokenAddress);

  // Deploy DonationNFT
  console.log("\n🏆 Deploying SimpleDonationNFT...");
  const DonationNFT = await ethers.getContractFactory("SimpleDonationNFT");
  const donationNFT = await DonationNFT.deploy();
  await donationNFT.waitForDeployment();
  const donationNFTAddress = await donationNFT.getAddress();
  console.log("✅ SimpleDonationNFT deployed to:", donationNFTAddress);

  // Deploy BloodDonation main contract
  console.log("\n🏥 Deploying SimpleBloodDonation...");
  const BloodDonation = await ethers.getContractFactory("SimpleBloodDonation");
  const bloodDonation = await BloodDonation.deploy(
    bloodTokenAddress,
    donationNFTAddress
  );
  await bloodDonation.waitForDeployment();
  const bloodDonationAddress = await bloodDonation.getAddress();
  console.log("✅ SimpleBloodDonation deployed to:", bloodDonationAddress);

  // Set up permissions
  console.log("\n⚙️  Setting up permissions...");
  
  // Add BloodDonation contract as authorized minter for BloodToken
  console.log("Adding BloodDonation as BloodToken minter...");
  await bloodToken.addMinter(bloodDonationAddress);
  console.log("✅ BloodToken minter permission granted");

  // Add BloodDonation contract as authorized minter for DonationNFT
  console.log("Adding BloodDonation as DonationNFT minter...");
  await donationNFT.addMinter(bloodDonationAddress);
  console.log("✅ DonationNFT minter permission granted");

  // Verify initial setup
  console.log("\n🔍 Verifying deployment...");
  
  const tokenName = await bloodToken.name();
  const tokenSymbol = await bloodToken.symbol();
  const tokenSupply = await bloodToken.totalSupply();
  console.log(`BloodToken: ${tokenName} (${tokenSymbol}) - Initial Supply: ${ethers.formatEther(tokenSupply)}`);

  const nftName = await donationNFT.name();
  const nftSymbol = await donationNFT.symbol();
  console.log(`DonationNFT: ${nftName} (${nftSymbol})`);

  const stats = await bloodDonation.getContractStats();
  console.log(`BloodDonation Stats - Donors: ${stats[0]}, Donations: ${stats[1]}, Tokens Distributed: ${ethers.formatEther(stats[2])}`);

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BloodToken: {
        address: bloodTokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        initialSupply: ethers.formatEther(tokenSupply),
      },
      DonationNFT: {
        address: donationNFTAddress,
        name: nftName,
        symbol: nftSymbol,
      },
      BloodDonation: {
        address: bloodDonationAddress,
      },
    },
    verification: {
      bloodTokenMinter: await bloodToken.authorizedMinters(bloodDonationAddress),
      nftMinter: await donationNFT.authorizedMinters(bloodDonationAddress),
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);

  // Generate environment variables for frontend
  const envVars = [
    `VITE_BLOOD_DONATION_CONTRACT=${bloodDonationAddress}`,
    `VITE_BLOOD_TOKEN_CONTRACT=${bloodTokenAddress}`,
    `VITE_DONATION_NFT_CONTRACT=${donationNFTAddress}`,
    `VITE_NETWORK_NAME=${hre.network.name}`,
    `VITE_CHAIN_ID=${(await ethers.provider.getNetwork()).chainId}`,
  ].join('\n');

  const envFile = path.join(__dirname, "../.env.contracts");
  fs.writeFileSync(envFile, envVars);
  console.log(`📝 Contract addresses saved to: ${envFile}`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("├── BloodToken:", bloodTokenAddress);
  console.log("├── DonationNFT:", donationNFTAddress);
  console.log("└── BloodDonation:", bloodDonationAddress);

  // Instructions for verification on block explorer
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 To verify contracts on block explorer, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${bloodTokenAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${donationNFTAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${bloodDonationAddress} ${bloodTokenAddress} ${donationNFTAddress}`);
  }

  // Demo operations (optional)
  console.log("\n🧪 Running demo operations...");
  
  try {
    // Register a demo donor
    const demoName = "Demo Donor";
    const demoBloodType = "A+";
    const demoLocation = "New York";
    
    console.log("Registering demo donor...");
    const registerTx = await bloodDonation.registerDonor(demoName, demoBloodType, demoLocation);
    await registerTx.wait();
    console.log("✅ Demo donor registered");

    // Log a demo donation
    console.log("Logging demo donation...");
    const donationTx = await bloodDonation.logDonation(demoBloodType, 2, "General Hospital");
    await donationTx.wait();
    console.log("✅ Demo donation logged");

    // Check updated stats
    const updatedStats = await bloodDonation.getContractStats();
    console.log(`Updated Stats - Donors: ${updatedStats[0]}, Donations: ${updatedStats[1]}, Tokens Distributed: ${ethers.utils.formatEther(updatedStats[2])}`);

    console.log("\n🎊 Demo operations completed successfully!");
  } catch (error) {
    console.log("⚠️  Demo operations failed (this is optional):", error.message);
  }

  console.log("\n=".repeat(80));
  console.log("🩸 BLOODCHAIN DEPLOYMENT COMPLETE 🩸");
  console.log("=".repeat(80));
}

// Handle deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
