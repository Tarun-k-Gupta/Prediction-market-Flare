// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FlarePredictionMarket
 * @dev Prediction market using Flare's FDC for event resolution
 * This is a simplified version - in production, integrate with actual FDC attestation providers
 */
contract FlarePredictionMarket {
    
    struct Market {
        string question;
        uint256 endTime;
        uint256 resolutionTime;
        bool resolved;
        bool outcome; // true = YES, false = NO
        uint256 totalYesStake;
        uint256 totalNoStake;
        address creator;
        bool active;
    }
    
    struct Position {
        uint256 yesStake;
        uint256 noStake;
        bool claimed;
    }
    
    // Market ID => Market
    mapping(uint256 => Market) public markets;
    
    // Market ID => User => Position
    mapping(uint256 => mapping(address => Position)) public positions;
    
    uint256 public marketCount;
    uint256 public constant MIN_BET = 0.01 ether;
    uint256 public constant PLATFORM_FEE = 2; // 2%
    
    address public owner;
    uint256 public collectedFees;
    
    event MarketCreated(uint256 indexed marketId, string question, uint256 endTime);
    event BetPlaced(uint256 indexed marketId, address indexed user, bool prediction, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Create a new prediction market
     */
    function createMarket(
        string memory _question,
        uint256 _durationInMinutes
    ) external returns (uint256) {
        require(_durationInMinutes >= 1 && _durationInMinutes <= 43200, "Invalid duration");
        
        uint256 marketId = marketCount++;
        uint256 endTime = block.timestamp + (_durationInMinutes * 1 minutes);
        
        markets[marketId] = Market({
            question: _question,
            endTime: endTime,
            resolutionTime: 0,
            resolved: false,
            outcome: false,
            totalYesStake: 0,
            totalNoStake: 0,
            creator: msg.sender,
            active: true
        });
        
        emit MarketCreated(marketId, _question, endTime);
        return marketId;
    }
    
    /**
     * @dev Place a bet on a market
     */
    function placeBet(uint256 _marketId, bool _predictYes) external payable {
        require(msg.value >= MIN_BET, "Bet too small");
        require(_marketId < marketCount, "Market doesn't exist");
        
        Market storage market = markets[_marketId];
        require(market.active, "Market not active");
        require(block.timestamp < market.endTime, "Market ended");
        require(!market.resolved, "Market already resolved");
        
        Position storage position = positions[_marketId][msg.sender];
        
        if (_predictYes) {
            position.yesStake += msg.value;
            market.totalYesStake += msg.value;
        } else {
            position.noStake += msg.value;
            market.totalNoStake += msg.value;
        }
        
        emit BetPlaced(_marketId, msg.sender, _predictYes, msg.value);
    }
    
    /**
     * @dev Resolve a market (simplified - in production use FDC attestation)
     * In real implementation, this would verify FDC proof before resolving
     */
    function resolveMarket(uint256 _marketId, bool _outcome) external onlyOwner {
        require(_marketId < marketCount, "Market doesn't exist");
        
        Market storage market = markets[_marketId];
        require(market.active, "Market not active");
        require(block.timestamp >= market.endTime, "Market not ended yet");
        require(!market.resolved, "Already resolved");
        
        market.resolved = true;
        market.outcome = _outcome;
        market.resolutionTime = block.timestamp;
        
        emit MarketResolved(_marketId, _outcome);
    }
    
    /**
     * @dev Claim winnings from a resolved market
     */
    function claimWinnings(uint256 _marketId) external {
        require(_marketId < marketCount, "Market doesn't exist");
        
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");
        
        Position storage position = positions[_marketId][msg.sender];
        require(!position.claimed, "Already claimed");
        
        uint256 winningStake = market.outcome ? position.yesStake : position.noStake;
        require(winningStake > 0, "No winning position");
        
        position.claimed = true;
        
        uint256 totalWinningStake = market.outcome ? market.totalYesStake : market.totalNoStake;
        uint256 totalLosingStake = market.outcome ? market.totalNoStake : market.totalYesStake;
        
        // Calculate winnings: original stake + proportional share of losing side
        uint256 share = (winningStake * totalLosingStake) / totalWinningStake;
        uint256 totalPayout = winningStake + share;
        
        // Deduct platform fee
        uint256 fee = (totalPayout * PLATFORM_FEE) / 100;
        uint256 finalPayout = totalPayout - fee;
        
        collectedFees += fee;
        
        payable(msg.sender).transfer(finalPayout);
        
        emit WinningsClaimed(_marketId, msg.sender, finalPayout);
    }
    
    /**
     * @dev Get market details
     */
    function getMarket(uint256 _marketId) external view returns (
        string memory question,
        uint256 endTime,
        bool resolved,
        bool outcome,
        uint256 totalYesStake,
        uint256 totalNoStake,
        bool active
    ) {
        Market memory market = markets[_marketId];
        return (
            market.question,
            market.endTime,
            market.resolved,
            market.outcome,
            market.totalYesStake,
            market.totalNoStake,
            market.active
        );
    }
    
    /**
     * @dev Get user position in a market
     */
    function getUserPosition(uint256 _marketId, address _user) external view returns (
        uint256 yesStake,
        uint256 noStake,
        bool claimed
    ) {
        Position memory position = positions[_marketId][_user];
        return (position.yesStake, position.noStake, position.claimed);
    }
    
    /**
     * @dev Calculate potential winnings
     */
    function calculatePotentialWinnings(uint256 _marketId, address _user, bool _outcome) 
        external 
        view 
        returns (uint256) 
    {
        Market memory market = markets[_marketId];
        Position memory position = positions[_marketId][_user];
        
        if (position.claimed) return 0;
        
        uint256 winningStake = _outcome ? position.yesStake : position.noStake;
        if (winningStake == 0) return 0;
        
        uint256 totalWinningStake = _outcome ? market.totalYesStake : market.totalNoStake;
        uint256 totalLosingStake = _outcome ? market.totalNoStake : market.totalYesStake;
        
        if (totalWinningStake == 0) return 0;
        
        uint256 share = (winningStake * totalLosingStake) / totalWinningStake;
        uint256 totalPayout = winningStake + share;
        uint256 fee = (totalPayout * PLATFORM_FEE) / 100;
        
        return totalPayout - fee;
    }
    
    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = collectedFees;
        collectedFees = 0;
        payable(owner).transfer(amount);
    }
}
