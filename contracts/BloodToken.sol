// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BloodToken (BLOOD)
 * @dev ERC-20 token for rewarding blood donors
 * @author BloodChain Team
 */
contract BloodToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // Token details
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 million tokens
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18; // 10 million tokens maximum
    
    // Minting control
    mapping(address => bool) public authorizedMinters;
    uint256 public totalMinted;
    
    // Staking functionality
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
    }
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% per year = 100 basis points
    uint256 public constant REWARD_PRECISION = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    
    // Modifiers
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor() ERC20("BloodToken", "BLOOD") {
        _mint(msg.sender, INITIAL_SUPPLY);
        totalMinted = INITIAL_SUPPLY;
        authorizedMinters[msg.sender] = true;
    }
    
    /**
     * @dev Mint tokens to a specific address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyAuthorizedMinter nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalMinted + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, amount);
        totalMinted += amount;
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
     * @dev Stake tokens to earn rewards
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        StakeInfo storage stakeInfo = stakes[msg.sender];
        
        // Claim existing rewards first
        if (stakeInfo.amount > 0) {
            _claimRewards(msg.sender);
        }
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update stake info
        stakeInfo.amount += amount;
        stakeInfo.timestamp = block.timestamp;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     * @param amount Amount of tokens to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount >= amount, "Insufficient staked amount");
        
        // Claim rewards first
        _claimRewards(msg.sender);
        
        // Update stake info
        stakeInfo.amount -= amount;
        totalStaked -= amount;
        
        if (stakeInfo.amount == 0) {
            stakeInfo.timestamp = 0;
            stakeInfo.rewardDebt = 0;
        } else {
            stakeInfo.timestamp = block.timestamp;
        }
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }
    
    /**
     * @dev Internal function to claim rewards
     * @param user Address of the user claiming rewards
     */
    function _claimRewards(address user) internal {
        StakeInfo storage stakeInfo = stakes[user];
        
        if (stakeInfo.amount == 0) {
            return;
        }
        
        uint256 reward = calculateReward(user);
        if (reward > 0) {
            // Mint reward tokens (within max supply limit)
            if (totalMinted + reward <= MAX_SUPPLY) {
                _mint(user, reward);
                totalMinted += reward;
                emit RewardClaimed(user, reward);
            }
        }
        
        stakeInfo.timestamp = block.timestamp;
    }
    
    /**
     * @dev Calculate pending rewards for a user
     * @param user Address of the user
     * @return Pending reward amount
     */
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        
        if (stakeInfo.amount == 0) {
            return 0;
        }
        
        uint256 timePassed = block.timestamp - stakeInfo.timestamp;
        uint256 reward = (stakeInfo.amount * rewardRate * timePassed) / (REWARD_PRECISION * SECONDS_PER_YEAR);
        
        return reward;
    }
    
    /**
     * @dev Get staking information for a user
     * @param user Address of the user
     * @return amount, timestamp, pendingReward
     */
    function getStakeInfo(address user) external view returns (uint256, uint256, uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        uint256 pendingReward = calculateReward(user);
        
        return (stakeInfo.amount, stakeInfo.timestamp, pendingReward);
    }
    
    /**
     * @dev Update reward rate (only owner)
     * @param newRate New reward rate in basis points
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Reward rate cannot exceed 10%"); // Max 10% APY
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
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
     * @dev Override required by Solidity for multiple inheritance
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Get token information
     * @return name, symbol, decimals, totalSupply, maxSupply
     */
    function getTokenInfo() external view returns (
        string memory,
        string memory,
        uint8,
        uint256,
        uint256
    ) {
        return (name(), symbol(), decimals(), totalSupply(), MAX_SUPPLY);
    }
    
    /**
     * @dev Emergency withdrawal of any accidentally sent tokens
     * @param token Address of the token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "Cannot withdraw BLOOD tokens");
        IERC20(token).transfer(owner(), amount);
    }
}
