import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/web3-context';
import { 
  CONTRACT_ADDRESSES, 
  BLOOD_DONATION_ABI, 
  BLOOD_TOKEN_ABI, 
  DONATION_NFT_ABI 
} from '@/lib/web3-config';
import { useToast } from '@/hooks/use-toast';

export function useSmartContracts() {
  const { signer, provider, isConnected } = useWeb3();
  const { toast } = useToast();

  // Contract instances
  const contracts = useMemo(() => {
    if (!provider) return null;

    return {
      bloodDonation: new ethers.Contract(
        CONTRACT_ADDRESSES.BLOOD_DONATION,
        BLOOD_DONATION_ABI,
        signer || provider
      ),
      bloodToken: new ethers.Contract(
        CONTRACT_ADDRESSES.BLOOD_TOKEN,
        BLOOD_TOKEN_ABI,
        signer || provider
      ),
      donationNFT: new ethers.Contract(
        CONTRACT_ADDRESSES.DONATION_NFT,
        DONATION_NFT_ABI,
        signer || provider
      ),
    };
  }, [provider, signer]);

  // Register donor
  const registerDonor = useCallback(async (name: string, bloodType: string) => {
    if (!contracts?.bloodDonation || !signer || !isConnected) {
      throw new Error('Not connected to blockchain');
    }

    try {
      const tx = await contracts.bloodDonation.registerDonor(
        await signer.getAddress(),
        name,
        bloodType
      );
      
      toast({
        title: "Transaction Submitted",
        description: `Registration transaction submitted. Hash: ${tx.hash.slice(0, 10)}...`,
      });

      const receipt = await tx.wait();
      
      toast({
        title: "Registration Successful",
        description: "You have been successfully registered as a donor!",
      });

      return receipt;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.reason || error.message || 'Registration failed');
    }
  }, [contracts, signer, isConnected, toast]);

  // Log donation
  const logDonation = useCallback(async (bloodType: string, quantity: number, hospital: string) => {
    if (!contracts?.bloodDonation || !signer || !isConnected) {
      throw new Error('Not connected to blockchain');
    }

    try {
      const tx = await contracts.bloodDonation.logDonation(bloodType, quantity, hospital);
      
      toast({
        title: "Transaction Submitted",
        description: `Donation logging transaction submitted. Hash: ${tx.hash.slice(0, 10)}...`,
      });

      const receipt = await tx.wait();
      
      toast({
        title: "Donation Logged",
        description: "Your donation has been successfully recorded on the blockchain!",
      });

      return receipt;
    } catch (error: any) {
      console.error('Donation logging error:', error);
      throw new Error(error.reason || error.message || 'Donation logging failed');
    }
  }, [contracts, signer, isConnected, toast]);

  // Get donor info
  const getDonorInfo = useCallback(async (address: string) => {
    if (!contracts?.bloodDonation) {
      throw new Error('Contract not available');
    }

    try {
      const donorInfo = await contracts.bloodDonation.donors(address);
      return {
        name: donorInfo.name,
        bloodType: donorInfo.bloodType,
        totalDonations: Number(donorInfo.totalDonations),
        isRegistered: donorInfo.isRegistered,
      };
    } catch (error: any) {
      console.error('Error fetching donor info:', error);
      throw new Error('Failed to fetch donor information');
    }
  }, [contracts]);

  // Get token balance
  const getTokenBalance = useCallback(async (address: string) => {
    if (!contracts?.bloodToken) {
      throw new Error('Token contract not available');
    }

    try {
      const balance = await contracts.bloodToken.balanceOf(address);
      return ethers.formatUnits(balance, 18);
    } catch (error: any) {
      console.error('Error fetching token balance:', error);
      throw new Error('Failed to fetch token balance');
    }
  }, [contracts]);

  // Get NFT balance
  const getNFTBalance = useCallback(async (address: string) => {
    if (!contracts?.donationNFT) {
      throw new Error('NFT contract not available');
    }

    try {
      const balance = await contracts.donationNFT.balanceOf(address);
      return Number(balance);
    } catch (error: any) {
      console.error('Error fetching NFT balance:', error);
      throw new Error('Failed to fetch NFT balance');
    }
  }, [contracts]);

  // Get NFT tokens owned by address
  const getNFTTokens = useCallback(async (address: string) => {
    if (!contracts?.donationNFT) {
      throw new Error('NFT contract not available');
    }

    try {
      const balance = await contracts.donationNFT.balanceOf(address);
      const tokens = [];

      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await contracts.donationNFT.tokenOfOwnerByIndex(address, i);
        const tokenURI = await contracts.donationNFT.tokenURI(tokenId);
        tokens.push({
          tokenId: Number(tokenId),
          tokenURI,
        });
      }

      return tokens;
    } catch (error: any) {
      console.error('Error fetching NFT tokens:', error);
      throw new Error('Failed to fetch NFT tokens');
    }
  }, [contracts]);

  // Mint NFT certificate
  const mintNFTCertificate = useCallback(async (to: string, tokenURI: string) => {
    if (!contracts?.donationNFT || !signer || !isConnected) {
      throw new Error('Not connected to blockchain');
    }

    try {
      const tx = await contracts.donationNFT.mint(to, tokenURI);
      
      toast({
        title: "NFT Minting Started",
        description: `NFT minting transaction submitted. Hash: ${tx.hash.slice(0, 10)}...`,
      });

      const receipt = await tx.wait();
      
      toast({
        title: "NFT Certificate Minted",
        description: "Your donation certificate NFT has been minted successfully!",
      });

      return receipt;
    } catch (error: any) {
      console.error('NFT minting error:', error);
      throw new Error(error.reason || error.message || 'NFT minting failed');
    }
  }, [contracts, signer, isConnected, toast]);

  return {
    contracts,
    registerDonor,
    logDonation,
    getDonorInfo,
    getTokenBalance,
    getNFTBalance,
    getNFTTokens,
    mintNFTCertificate,
    isContractsReady: Boolean(contracts && isConnected),
  };
}
