# Demo Video : https://youtu.be/ZfXyxlcWTnQ
# 🔮 Flare Prediction Market ( 0x3353E8557e63bd506d54AdDa7daB122aBc5a5b67 ) 

A decentralized prediction market built on **Flare Network**, enabling users to create and bet on real-world events with transparent, smart contract-powered resolution.

## 🎯 Features

- **Create Markets**: Deploy prediction markets on any binary outcome
- **Place Bets**: Stake FLR tokens on YES/NO outcomes with dynamic odds
- **Real-time Odds**: Pool-based pricing adjusts with market participation
- **Claim Winnings**: Automated payout distribution to winners
- **Admin Resolution**: Market creators resolve outcomes and collect platform fees
- **Wallet Integration**: Seamless MetaMask connection for Flare Network

## 🏗️ Architecture

**Frontend**: Modular JavaScript components with ethers.js  
**Smart Contract**: Solidity-based prediction market logic  
**Network**: Flare Network for fast, low-cost transactions  
**Integration Ready**: Architecture supports Flare Data Connector (FDC) for oracle-based automated resolution

## 🛠️ Tech Stack

- **Blockchain**: Flare Network
- **Smart Contract**: Solidity ^0.8.19
- **Frontend**: Vanilla JS, HTML5, CSS3
- **Web3 Library**: ethers.js v6
- **Wallet**: MetaMask
- **Flare Tools**: FDC-ready architecture for future oracle integration

## 📦 Project Structure

```
flare-prediction-market/
├── index.html              # Main application
├── styles.css              # UI styling
├── config.js               # Contract configuration
├── utils.js                # Helper functions
├── app.js                  # Core application logic
└── components/
    ├── wallet.js           # Wallet management
    ├── market.js           # Market display
    └── admin.js            # Owner controls
```

## 🚀 Deployed Contract

**Contract Address**: `0x3353E8557e63bd506d54AdDa7daB122aBc5a5b67`  
**Network**: Flare Network  
**Explorer**: View on Flare Explorer

## 💡 Key Functions

| Function | Description |
|----------|-------------|
| `createMarket()` | Deploy new prediction market |
| `placeBet()` | Stake tokens on outcome |
| `resolveMarket()` | Finalize market results |
| `claimWinnings()` | Withdraw earnings |
| `calculatePotentialWinnings()` | Preview returns |

## 🔮 Flare Integration

- Native FLR token for all transactions
- Gas-efficient smart contracts optimized for Flare
- Fast transaction finality leveraging Flare's Avalanche consensus

- **Automated Resolution**: Markets resolve via FDC attestations
- **Oracle Data**: Real-world event verification
- **Trustless Outcomes**: Eliminate manual resolution dependency
- **Cross-chain Data**: Access external APIs for market settlement

## 🔒 Security Features

- **Reentrancy Protection**: Safe withdrawal patterns
- **Access Control**: Owner-only administrative functions
- **Timestamp Validation**: Prevent premature market resolution
- **Claim Tracking**: One-time payout enforcement

## 🌟 Future Roadmap

1. **FDC Oracle Integration**: Automated market resolution via Flare Data Connector
2. **Multi-Market Support**: Create markets on different event categories
3. **Liquidity Pools**: AMM-style market making for better odds
4. **Social Features**: User profiles, leaderboards, and reputation scores
5. **Mobile App**: Native iOS/Android applications
6. **Advanced Analytics**: Historical data and market insights
7. **Governance Token**: Community-driven platform decisions

## 🎯 Use Cases

- **Sports Betting**: Decentralized sports prediction markets
- **Financial Markets**: Crypto price predictions and derivatives
- **Political Events**: Election outcomes and policy decisions
- **Entertainment**: Award shows, box office results
- **Community Polls**: DAO governance and decision-making

## 📊 Smart Contract Details

**Language**: Solidity ^0.8.19  
**Platform Fee**: 2% on winnings  
**Minimum Bet**: 0.01 FLR  
**Gas Optimized**: Efficient storage patterns

## 🚦 Getting Started

### Prerequisites
- MetaMask wallet
- FLR tokens (testnet or mainnet)
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/flare-prediction-market
cd flare-prediction-market
```

2. Update contract address in `config.js`:
```javascript
CONTRACT_ADDRESS: '0x3353E8557e63bd506d54AdDa7daB122aBc5a5b67'
```

3. Serve the application:
```bash
python -m http.server 8000
# or use any static file server
```

4. Open browser and navigate to `http://localhost:8000`

5. Connect MetaMask to Flare Network

6. Start creating and betting on markets!

## 🔧 Configuration

Update `config.js` for customization:

```javascript
const CONFIG = {
    CONTRACT_ADDRESS: 'your_contract_address',
    MIN_BET: 0.01,
    REFRESH_INTERVAL: 30000
};
```


## 📈 Technical Highlights

- **Component-Based Architecture**: Modular, maintainable codebase
- **Async/Await Patterns**: Clean asynchronous operations
- **Error Handling**: Comprehensive try-catch blocks
- **Event Listeners**: Real-time blockchain event tracking
- **Gas Optimization**: Efficient contract design


