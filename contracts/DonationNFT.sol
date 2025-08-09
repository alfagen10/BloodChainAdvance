// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DonationNFT
 * @dev ERC-721 NFT certificates for blood donation records
 * @author BloodChain Team
 */
contract DonationNFT is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    ERC721Pausable, 
    Ownable, 
    ReentrancyGuard 
{
    using Counters for Counters.Counter;
    
    // Token ID counter
    Counters.Counter private _tokenIdCounter;
    
    // Certificate metadata
    struct CertificateInfo {
        address donor;
        string bloodType;
        uint256 quantity;
        string hospital;
        string location;
        uint256 donationDate;
        bool isVerified;
        address verifier;
    }
    
    // Mappings
    mapping(uint256 => CertificateInfo) public certificates;
    mapping(address => bool) public authorizedMinters;
    mapping(address => uint256[]) public donorCertificates;
    
    // Constants
    uint256 public constant MAX_SUPPLY = 100000; // Maximum NFTs that can be minted
    string private _baseTokenURI;
    
    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed donor,
        string bloodType,
        uint256 quantity,
        string hospital
    );
    event CertificateVerified(uint256 indexed tokenId, address indexed verifier);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event BaseURIUpdated(string newBaseURI);
    
    // Modifiers
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _;
    }
    
    /**
     * @dev Constructor
     * @param name Name of the NFT collection
     * @param symbol Symbol of the NFT collection
     * @param baseTokenURI Base URI for token metadata
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
        authorizedMinters[msg.sender] = true;
    }
    
    /**
     * @dev Mint a new donation certificate NFT
     * @param to Address to mint the NFT to
     * @param tokenURI URI for the token metadata
     * @return tokenId The ID of the minted token
     */
    function mint(
        address to,
        string memory tokenURI
    ) external onlyAuthorizedMinter nonReentrant whenNotPaused returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Store basic certificate info (can be updated later with full details)
        certificates[tokenId] = CertificateInfo({
            donor: to,
            bloodType: "",
            quantity: 0,
            hospital: "",
            location: "",
            donationDate: block.timestamp,
            isVerified: false,
            verifier: address(0)
        });
        
        donorCertificates[to].push(tokenId);
        
        emit CertificateMinted(tokenId, to, "", 0, "");
        
        return tokenId;
    }
    
    /**
     * @dev Mint a certificate with complete donation details
     * @param to Address to mint the NFT to
     * @param tokenURI URI for the token metadata
     * @param bloodType Type of blood donated
     * @param quantity Number of units donated
     * @param hospital Hospital where donation was made
     * @param location Location of the donation
     * @return tokenId The ID of the minted token
     */
    function mintWithDetails(
        address to,
        string memory tokenURI,
        string memory bloodType,
        uint256 quantity,
        string memory hospital,
        string memory location
    ) external onlyAuthorizedMinter nonReentrant whenNotPaused returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        require(bytes(bloodType).length > 0, "Blood type cannot be empty");
        require(quantity > 0, "Quantity must be greater than 0");
        require(bytes(hospital).length > 0, "Hospital cannot be empty");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Store complete certificate info
        certificates[tokenId] = CertificateInfo({
            donor: to,
            bloodType: bloodType,
            quantity: quantity,
            hospital: hospital,
            location: location,
            donationDate: block.timestamp,
            isVerified: false,
            verifier: address(0)
        });
        
        donorCertificates[to].push(tokenId);
        
        emit CertificateMinted(tokenId, to, bloodType, quantity, hospital);
        
        return tokenId;
    }
    
    /**
     * @dev Update certificate details (only for incomplete certificates)
     * @param tokenId ID of the token to update
     * @param bloodType Type of blood donated
     * @param quantity Number of units donated
     * @param hospital Hospital where donation was made
     * @param location Location of the donation
     */
    function updateCertificateDetails(
        uint256 tokenId,
        string memory bloodType,
        uint256 quantity,
        string memory hospital,
        string memory location
    ) external onlyAuthorizedMinter tokenExists(tokenId) {
        CertificateInfo storage cert = certificates[tokenId];
        require(!cert.isVerified, "Cannot update verified certificate");
        
        cert.bloodType = bloodType;
        cert.quantity = quantity;
        cert.hospital = hospital;
        cert.location = location;
    }
    
    /**
     * @dev Verify a certificate (can only be done once)
     * @param tokenId ID of the token to verify
     */
    function verifyCertificate(uint256 tokenId) external tokenExists(tokenId) {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to verify");
        
        CertificateInfo storage cert = certificates[tokenId];
        require(!cert.isVerified, "Certificate already verified");
        require(bytes(cert.bloodType).length > 0, "Certificate details incomplete");
        
        cert.isVerified = true;
        cert.verifier = msg.sender;
        
        emit CertificateVerified(tokenId, msg.sender);
    }
    
    /**
     * @dev Get certificate information
     * @param tokenId ID of the token
     * @return CertificateInfo struct
     */
    function getCertificateInfo(uint256 tokenId) external view tokenExists(tokenId) returns (CertificateInfo memory) {
        return certificates[tokenId];
    }
    
    /**
     * @dev Get all certificate IDs owned by an address
     * @param donor Address of the donor
     * @return Array of token IDs
     */
    function getCertificatesByDonor(address donor) external view returns (uint256[] memory) {
        return donorCertificates[donor];
    }
    
    /**
     * @dev Add an authorized minter
     * @param minter Address to authorize for minting
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Cannot add zero address as minter");
        require(!authorizedMinters[minter], "Already a minter");
        
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove an authorized minter
     * @param minter Address to remove from minting authorization
     */
    function removeMinter(address minter) external onlyOwner {
        require(minter != address(0), "Cannot remove zero address");
        require(authorizedMinters[minter], "Not a minter");
        require(minter != owner(), "Cannot remove owner as minter");
        
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Set base URI for token metadata
     * @param baseTokenURI New base URI
     */
    function setBaseURI(string memory baseTokenURI) external onlyOwner {
        _baseTokenURI = baseTokenURI;
        emit BaseURIUpdated(baseTokenURI);
    }
    
    /**
     * @dev Get the current token ID counter
     * @return Current token ID
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Check if a certificate is verified
     * @param tokenId ID of the token to check
     * @return Boolean indicating verification status
     */
    function isCertificateVerified(uint256 tokenId) external view tokenExists(tokenId) returns (bool) {
        return certificates[tokenId].isVerified;
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override for base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Get collection statistics
     * @return totalSupply, maxSupply, totalVerified
     */
    function getCollectionStats() external view returns (uint256, uint256, uint256) {
        uint256 totalVerified = 0;
        uint256 currentSupply = totalSupply();
        
        for (uint256 i = 1; i <= currentSupply; i++) {
            if (_exists(i) && certificates[i].isVerified) {
                totalVerified++;
            }
        }
        
        return (currentSupply, MAX_SUPPLY, totalVerified);
    }
}
