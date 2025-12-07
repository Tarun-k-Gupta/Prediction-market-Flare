// Wallet Component
const WalletComponent = {
    render: () => {
        return `
            <div class="card header-card">
                <div class="logo">F</div>
                <div class="header-info">
                    <h1>FLARE PREDICT</h1>
                    <div class="header-subtitle">Prediction Markets • Flare Network</div>
                </div>
            </div>

            <div class="card wallet-card">
                <h3>Wallet</h3>
                <div id="ownerBadgeContainer"></div>
                <div class="wallet-address" id="walletAddress">Not Connected</div>
                <div class="wallet-balance" id="walletBalance">0.0 FLR</div>
                <button class="btn btn-primary" id="connectBtn" onclick="App.connectWallet()">Connect Wallet</button>
                
                <div class="divider"></div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Network</div>
                        <div class="info-value">Flare</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value" id="connectionStatus">Offline</div>
                    </div>
                </div>

                <div id="adminControls" class="admin-section"></div>
            </div>

            <div class="card create-section">
                <h2>Create Market</h2>
                <div class="form-group">
                    <label>Question</label>
                    <textarea id="questionInput" placeholder="Will Bitcoin reach $100k by end of 2025?"></textarea>
                </div>
                <div class="form-group">
                    <label>Duration (minutes)</label>
                    <input type="number" id="durationInput" value="5" min="1" max="1440">
                </div>
                <button class="btn btn-primary" onclick="App.createMarket()">Create Market</button>
            </div>
        `;
    },

    updateWalletInfo: (address, balance, status) => {
        document.getElementById('walletAddress').textContent = 
            address ? Utils.formatAddress(address) : 'Not Connected';
        document.getElementById('walletBalance').textContent = 
            balance ? Utils.formatBalance(balance) : '0.0 FLR';
        document.getElementById('connectionStatus').textContent = status;
        
        const btn = document.getElementById('connectBtn');
        if (address) {
            btn.textContent = 'Connected';
            btn.className = 'btn btn-connected';
        } else {
            btn.textContent = 'Connect Wallet';
            btn.className = 'btn btn-primary';
        }
    },

    showOwnerBadge: (isOwner) => {
        const container = document.getElementById('ownerBadgeContainer');
        if (isOwner) {
            container.innerHTML = '<div class="owner-badge">Contract Owner</div>';
        } else {
            container.innerHTML = '';
        }
    }
};