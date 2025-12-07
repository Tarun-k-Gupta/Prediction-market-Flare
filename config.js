// Configuration
const CONFIG = {
    CONTRACT_ADDRESS: '0x3353E8557e63bd506d54AdDa7daB122aBc5a5b67',
    CONTRACT_ABI: [
        "function marketCount() view returns (uint256)",
        "function getMarket(uint256) view returns (string, uint256, bool, bool, uint256, uint256, bool)",
        "function getUserPosition(uint256, address) view returns (uint256, uint256, bool)",
        "function calculatePotentialWinnings(uint256, address, bool) view returns (uint256)",
        "function createMarket(string, uint256) returns (uint256)",
        "function placeBet(uint256, bool) payable",
        "function claimWinnings(uint256)",
        "function resolveMarket(uint256, bool)",
        "function owner() view returns (address)",
        "function collectedFees() view returns (uint256)",
        "function withdrawFees()",
        "event MarketCreated(uint256 indexed marketId, string question, uint256 endTime)",
        "event BetPlaced(uint256 indexed marketId, address indexed user, bool prediction, uint256 amount)",
        "event MarketResolved(uint256 indexed marketId, bool outcome)",
        "event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount)"
    ],
    MIN_BET: 0.01,
    REFRESH_INTERVAL: 30000
};