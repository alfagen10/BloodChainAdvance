// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./BloodToken.sol";
import "./DonationNFT.sol";

/**
 * @title BloodDonation
 * @dev Main contract for managing blood donations and donor registration
 * @author BloodChain Team
 */
contract BloodDonation is Ownable, ReentrancyGuard, Pausable {
    
    // Struct to store donor information
    struct Donor {
        string name;
        string bloodType;
        string location;
        uint256 totalDonations;
        uint256 totalUnits;
        uint256 rewardPoints;
        bool isRegistered;
        uint256 registeredAt;
    }
    
    // Struct to store donation information
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
    
    // State variables
    mapping(address => Donor) public donors;
    mapping(uint256 => Donation) public donations;
    mapping(string => mapping(string => uint256)) public bloodSupply; // location => bloodType => quantity
    
    address[] public donorAddresses;
    uint256 public totalDonations;
    uint256 public totalDonors;
    uint256 private donationIdCounter;
    
    // Token contracts
    BloodToken public bloodToken;
    DonationNFT public donationNFT;
    
    // Constants
    uint256 public constant TOKENS_PER_UNIT = 10 * 10**18; // 10 BLOOD tokens per unit
    uint256 public constant MIN_DONATION_UNITS = 1;
    uint256 public constant MAX_DONATION_UNITS = 5;
    
    // Events
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
    event BloodSupplyUpdated(string location, string bloodType, uint256 newQuantity);
    
    // Modifiers
    modifier onlyRegisteredDonor() {
        require(donors[msg.sender].isRegistered, "Donor not registered");
        _;
    }
    
    modifier validBloodType(string memory _bloodType) {
        require(
            keccak256(abi.encodePacked(_bloodType)) == keccak256("A+") ||
            keccak256(abi.encodePacked(_bloodType)) == keccak256("A-") ||
            keccak256(abi.encodePacked(_bloodType)) == keccak256("B+") ||
            keccak256(abi.encodePacked(_bloodType)) == keccak256("B-") ||
            keccak256(abi.encodePacked(_bloodType)) == keccak256("AB+") ||
            keccak256(abi.encodePacked(_bloodType)) == keccak256("AB-") ||
            keccak256(abi.encodePacked(_bloodType)) == keccak256("O+") ||
            keccak256(abi.encodePacked(_bloodType)) == keccak256("O-"),
            "Invalid blood type"
        );
        _;
    }
    
    /**
     * @dev Constructor
     * @param _bloodToken Address of the BloodToken contract
     * @param _donationNFT Address of the DonationNFT contract
     */
    constructor(address _bloodToken, address _donationNFT) {
        bloodToken = BloodToken(_bloodToken);
        donationNFT = DonationNFT(_donationNFT);
    }
    
    /**
     * @dev Register a new donor
     * @param _name Donor's full name
     * @param _bloodType Donor's blood type
     * @param _location Donor's location
     */
    function registerDonor(
        string memory _name,
        string memory _bloodType,
        string memory _location
    ) external validBloodType(_bloodType) whenNotPaused {
        require(!donors[msg.sender].isRegistered, "Donor already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");
        
        donors[msg.sender] = Donor({
            name: _name,
            bloodType: _bloodType,
            location: _location,
            totalDonations: 0,
            totalUnits: 0,
            rewardPoints: 0,
            isRegistered: true,
            registeredAt: block.timestamp
        });
        
        donorAddresses.push(msg.sender);
        totalDonors++;
        
        emit DonorRegistered(msg.sender, _name, _bloodType, _location);
    }
    
    /**
     * @dev Log a new blood donation
     * @param _bloodType Type of blood donated
     * @param _quantity Number of units donated
     * @param _hospital Hospital where donation was made
     */
    function logDonation(
        string memory _bloodType,
        uint256 _quantity,
        string memory _hospital
    ) external onlyRegisteredDonor validBloodType(_bloodType) nonReentrant whenNotPaused {
        require(_quantity >= MIN_DONATION_UNITS && _quantity <= MAX_DONATION_UNITS, "Invalid quantity");
        require(bytes(_hospital).length > 0, "Hospital name cannot be empty");
        
        Donor storage donor = donors[msg.sender];
        uint256 donationId = ++donationIdCounter;
        
        // Store donation record
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
        
        // Update donor stats
        donor.totalDonations++;
        donor.totalUnits += _quantity;
        donor.rewardPoints += _quantity * 10; // 10 points per unit
        
        // Update blood supply
        bloodSupply[donor.location][_bloodType] += _quantity;
        
        totalDonations++;
        
        // Mint reward tokens
        uint256 tokenReward = _quantity * TOKENS_PER_UNIT;
        bloodToken.mint(msg.sender, tokenReward);
        
        emit DonationLogged(donationId, msg.sender, _bloodType, _quantity, _hospital, donor.location);
        emit TokensRewarded(msg.sender, tokenReward);
        emit BloodSupplyUpdated(donor.location, _bloodType, bloodSupply[donor.location][_bloodType]);
    }
    
    /**
     * @dev Mint NFT certificate for a donation
     * @param _donationId ID of the donation
     * @param _tokenURI Metadata URI for the NFT
     */
    function mintDonationNFT(
        uint256 _donationId,
        string memory _tokenURI
    ) external onlyRegisteredDonor nonReentrant whenNotPaused {
        require(_donationId > 0 && _donationId <= donationIdCounter, "Invalid donation ID");
        
        Donation storage donation = donations[_donationId];
        require(donation.donor == msg.sender, "Not your donation");
        require(!donation.nftMinted, "NFT already minted");
        
        uint256 tokenId = donationNFT.mint(msg.sender, _tokenURI);
        donation.nftTokenId = tokenId;
        donation.nftMinted = true;
        
        emit NFTMinted(msg.sender, tokenId, _donationId);
    }
    
    /**
     * @dev Get donor information
     * @param _donor Address of the donor
     * @return Donor struct
     */
    function getDonorInfo(address _donor) external view returns (Donor memory) {
        return donors[_donor];
    }
    
    /**
     * @dev Get donation information
     * @param _donationId ID of the donation
     * @return Donation struct
     */
    function getDonation(uint256 _donationId) external view returns (Donation memory) {
        return donations[_donationId];
    }
    
    /**
     * @dev Get blood supply for a location and blood type
     * @param _location Location to check
     * @param _bloodType Blood type to check
     * @return Current supply quantity
     */
    function getBloodSupply(string memory _location, string memory _bloodType) external view returns (uint256) {
        return bloodSupply[_location][_bloodType];
    }
    
    /**
     * @dev Get all donor addresses
     * @return Array of donor addresses
     */
    function getAllDonors() external view returns (address[] memory) {
        return donorAddresses;
    }
    
    /**
     * @dev Get contract statistics
     * @return totalDonors, totalDonations, totalTokensDistributed
     */
    function getContractStats() external view returns (uint256, uint256, uint256) {
        uint256 totalTokensDistributed = bloodToken.totalSupply();
        return (totalDonors, totalDonations, totalTokensDistributed);
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Update token contracts (for upgrades)
     * @param _bloodToken New BloodToken contract address
     * @param _donationNFT New DonationNFT contract address
     */
    function updateTokenContracts(address _bloodToken, address _donationNFT) external onlyOwner {
        require(_bloodToken != address(0) && _donationNFT != address(0), "Invalid addresses");
        bloodToken = BloodToken(_bloodToken);
        donationNFT = DonationNFT(_donationNFT);
    }
    
    /**
     * @dev Withdraw any accidentally sent ETH
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
    }
}
