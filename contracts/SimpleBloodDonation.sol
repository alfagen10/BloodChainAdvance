// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SimpleBloodToken.sol";
import "./SimpleDonationNFT.sol";

contract SimpleBloodDonation is Ownable, ReentrancyGuard {
    
    struct Donor {
        string name;
        string bloodType;
        string location;
        uint256 totalDonations;
        uint256 totalUnits;
        bool isRegistered;
        uint256 registeredAt;
    }
    
    struct Donation {
        address donor;
        string bloodType;
        uint256 quantity;
        string hospital;
        string location;
        uint256 timestamp;
        uint256 nftTokenId;
        bool nftMinted;
    }
    
    mapping(address => Donor) public donors;
    mapping(uint256 => Donation) public donations;
    
    address[] public donorAddresses;
    uint256 public totalDonations;
    uint256 public totalDonors;
    uint256 private donationIdCounter;
    
    SimpleBloodToken public bloodToken;
    SimpleDonationNFT public donationNFT;
    
    uint256 public constant TOKENS_PER_UNIT = 10 * 10**18; // 10 BLOOD tokens per unit
    
    event DonorRegistered(address indexed donor, string name, string bloodType, string location);
    event DonationLogged(
        uint256 indexed donationId,
        address indexed donor,
        string bloodType,
        uint256 quantity,
        string hospital,
        string location
    );
    event TokensRewarded(address indexed donor, uint256 amount);
    event NFTMinted(address indexed donor, uint256 tokenId, uint256 donationId);
    
    constructor(address _bloodToken, address _donationNFT) Ownable(msg.sender) {
        bloodToken = SimpleBloodToken(_bloodToken);
        donationNFT = SimpleDonationNFT(_donationNFT);
    }
    
    function registerDonor(
        string memory _name,
        string memory _bloodType,
        string memory _location
    ) external {
        require(!donors[msg.sender].isRegistered, "Already registered");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_location).length > 0, "Location required");
        
        donors[msg.sender] = Donor({
            name: _name,
            bloodType: _bloodType,
            location: _location,
            totalDonations: 0,
            totalUnits: 0,
            isRegistered: true,
            registeredAt: block.timestamp
        });
        
        donorAddresses.push(msg.sender);
        totalDonors++;
        
        emit DonorRegistered(msg.sender, _name, _bloodType, _location);
    }
    
    function logDonation(
        string memory _bloodType,
        uint256 _quantity,
        string memory _hospital
    ) external nonReentrant {
        require(donors[msg.sender].isRegistered, "Not registered");
        require(_quantity > 0 && _quantity <= 5, "Invalid quantity");
        require(bytes(_hospital).length > 0, "Hospital required");
        
        Donor storage donor = donors[msg.sender];
        uint256 donationId = ++donationIdCounter;
        
        donations[donationId] = Donation({
            donor: msg.sender,
            bloodType: _bloodType,
            quantity: _quantity,
            hospital: _hospital,
            location: donor.location,
            timestamp: block.timestamp,
            nftTokenId: 0,
            nftMinted: false
        });
        
        donor.totalDonations++;
        donor.totalUnits += _quantity;
        totalDonations++;
        
        // Mint reward tokens
        uint256 tokenReward = _quantity * TOKENS_PER_UNIT;
        bloodToken.mint(msg.sender, tokenReward);
        
        emit DonationLogged(donationId, msg.sender, _bloodType, _quantity, _hospital, donor.location);
        emit TokensRewarded(msg.sender, tokenReward);
    }
    
    function mintDonationNFT(
        uint256 _donationId,
        string memory _tokenURI
    ) external nonReentrant {
        require(_donationId > 0 && _donationId <= donationIdCounter, "Invalid donation ID");
        
        Donation storage donation = donations[_donationId];
        require(donation.donor == msg.sender, "Not your donation");
        require(!donation.nftMinted, "NFT already minted");
        
        uint256 tokenId = donationNFT.mint(msg.sender, _tokenURI);
        donation.nftTokenId = tokenId;
        donation.nftMinted = true;
        
        emit NFTMinted(msg.sender, tokenId, _donationId);
    }
    
    function getDonorInfo(address _donor) external view returns (Donor memory) {
        return donors[_donor];
    }
    
    function getDonation(uint256 _donationId) external view returns (Donation memory) {
        return donations[_donationId];
    }
    
    function getAllDonors() external view returns (address[] memory) {
        return donorAddresses;
    }
    
    function getContractStats() external view returns (uint256, uint256, uint256) {
        uint256 totalTokensDistributed = bloodToken.totalSupply();
        return (totalDonors, totalDonations, totalTokensDistributed);
    }
}