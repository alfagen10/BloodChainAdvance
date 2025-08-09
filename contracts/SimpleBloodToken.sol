// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleBloodToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18; // 10 million tokens
    mapping(address => bool) public authorizedMinters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor() ERC20("BloodToken", "BLOOD") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10**18); // Initial 1M tokens
        authorizedMinters[msg.sender] = true;
    }
    
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function addMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
}