// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleDonationNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    mapping(address => bool) public authorizedMinters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor() ERC721("BloodChain Certificate", "BDCERT") Ownable(msg.sender) {
        authorizedMinters[msg.sender] = true;
    }
    
    function mint(address to, string memory uri) external returns (uint256) {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        return tokenId;
    }
    
    function addMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}