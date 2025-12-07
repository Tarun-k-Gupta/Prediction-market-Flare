// Main Application
const App = {
    state: {
        provider: null,
        signer: null,
        contract: null,
        userAddress: null,
        contractOwner: null,
        isOwner: false
    },

    init: async () => {
        // Render initial UI
        document.getElementById('sidebar').innerHTML = WalletComponent.render();

        // Check for existing connection
        const hasMetaMask = await App.detectMetaMask();
        
        if (hasMetaMask) {
            // Setup event listeners
            window.ethereum.on('accountsChanged', App.handleAccountsChanged);
            window.ethereum.on('chainChanged', () => window.location.reload());
        }
    },

    detectMetaMask: () => {
        return new Promise((resolve) => {
            if (window.ethereum) {
                resolve(true);
            } else {
                let attempts = 0;
                const interval = setInterval(() => {
                    attempts++;
                    if (window.ethereum) {
                        clearInterval(interval);
                        resolve(true);
                    } else if (attempts > 30) {
                        clearInterval(interval);
                        resolve(false);
                    }
                }, 100);
            }
        });
    },

    connectWallet: async () => {
        if (!window.ethereum) {
            Utils.showNotification('MetaMask not detected. Please install MetaMask extension.', 'error');
            return;
        }

        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length === 0) {
                Utils.showNotification('No accounts found. Please unlock MetaMask.', 'error');
                return;
            }

            App.state.provider = new ethers.BrowserProvider(window.ethereum);
            App.state.signer = await App.state.provider.getSigner();
            App.state.userAddress = await App.state.signer.getAddress();
            
            if (CONFIG.CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') {
                Utils.showNotification('Please deploy contract and update CONTRACT_ADDRESS', 'error');
                
                const balance = await App.state.provider.getBalance(App.state.userAddress);
                WalletComponent.updateWalletInfo(App.state.userAddress, balance, 'No Contract');
                return;
            }
            
            App.state.contract = new ethers.Contract(
                CONFIG.CONTRACT_ADDRESS, 
                CONFIG.CONTRACT_ABI, 
                App.state.signer
            );
            
            // Check if user is owner
            try {
                App.state.contractOwner = await App.state.contract.owner();
                App.state.isOwner = App.state.userAddress.toLowerCase() === 
                                   App.state.contractOwner.toLowerCase();
                
                WalletComponent.showOwnerBadge(App.state.isOwner);
                
                if (App.state.isOwner) {
                    document.getElementById('adminControls').innerHTML = AdminComponent.render();
                    document.getElementById('adminControls').classList.add('visible');
                    await AdminComponent.updateFees();
                }
            } catch (e) {
                console.error('Error checking owner:', e);
            }
            
            const balance = await App.state.provider.getBalance(App.state.userAddress);
            WalletComponent.updateWalletInfo(App.state.userAddress, balance, 'Online');
            
            // Load markets after connection
            await App.loadMarkets();
            
            Utils.showNotification('Wallet connected successfully', 'success');
        } catch (error) {
            console.error('Connection error:', error);
            
            if (error.code === 4001) {
                Utils.showNotification('Connection rejected by user', 'error');
            } else if (error.code === -32002) {
                Utils.showNotification('Please check MetaMask - connection request pending', 'error');
            } else {
                Utils.showNotification('Failed to connect: ' + error.message, 'error');
            }
        }
    },

    handleAccountsChanged: (accounts) => {
        if (accounts.length > 0) {
            window.location.reload();
        } else {
            document.getElementById('walletAddress').textContent = 'Not Connected';
            document.getElementById('walletBalance').textContent = '0.0 FLR';
            document.getElementById('connectBtn').textContent = 'Connect Wallet';
            document.getElementById('connectBtn').className = 'btn btn-primary';
            document.getElementById('connectionStatus').textContent = 'Offline';
            document.getElementById('ownerBadgeContainer').innerHTML = '';
            document.getElementById('adminControls').classList.remove('visible');
            App.state.isOwner = false;
            
            // Reset markets view
            document.getElementById('marketsContainer').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <div>Connect your wallet to view markets</div>
                </div>
            `;
        }
    },

    createMarket: async () => {
        const question = document.getElementById('questionInput').value;
        const duration = document.getElementById('durationInput').value;

        if (!question || !duration) {
            Utils.showNotification('Please fill all fields', 'error');
            return;
        }

        if (!App.state.contract) {
            Utils.showNotification('Please connect wallet first', 'error');
            return;
        }

        try {
            Utils.showNotification('Creating market...', 'info');
            const tx = await App.state.contract.createMarket(question, duration);
            await tx.wait();
            
            document.getElementById('questionInput').value = '';
            document.getElementById('durationInput').value = '5';
            
            Utils.showNotification('Market created successfully', 'success');
            await App.loadMarkets();
        } catch (error) {
            console.error(error);
            Utils.showNotification('Failed to create market: ' + error.message, 'error');
        }
    },

    loadMarkets: async () => {
        if (!App.state.contract) return;

        try {
            const count = await App.state.contract.marketCount();
            const container = document.getElementById('marketsContainer');
            container.innerHTML = '';

            if (count === 0n) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📊</div>
                        <div>No markets yet. Create the first one!</div>
                    </div>
                `;
                return;
            }

            const marketPromises = [];
            for (let i = 0; i < count; i++) {
                marketPromises.push(App.loadSingleMarket(i));
            }

            const markets = await Promise.all(marketPromises);
            
            for (const marketHTML of markets) {
                if (marketHTML) {
                    const marketDiv = document.createElement('div');
                    marketDiv.innerHTML = marketHTML;
                    container.appendChild(marketDiv.firstElementChild);
                }
            }

            if (App.state.isOwner) {
                await AdminComponent.updateFees();
            }
        } catch (error) {
            console.error('Error loading markets:', error);
            Utils.showNotification('Failed to load markets', 'error');
        }
    },

    loadSingleMarket: async (id) => {
        try {
            const market = await App.state.contract.getMarket(id);
            const [question, endTime, resolved, outcome, yesStake, noStake, active] = market;
            
            if (!active) return null;

            return await MarketComponent.renderMarketCard({
                id,
                question,
                endTime,
                resolved,
                outcome,
                yesStake,
                noStake
            });
        } catch (e) {
            console.error(`Error loading market ${id}:`, e);
            return null;
        }
    },

    placeBet: async (marketId, predictYes) => {
        const amount = document.getElementById(`betAmount${marketId}`).value;
        
        if (!amount || parseFloat(amount) < CONFIG.MIN_BET) {
            Utils.showNotification(`Minimum bet is ${CONFIG.MIN_BET} FLR`, 'error');
            return;
        }

        try {
            Utils.showNotification('Placing bet...', 'info');
            const tx = await App.state.contract.placeBet(marketId, predictYes, {
                value: ethers.parseEther(amount)
            });
            await tx.wait();
            
            Utils.showNotification('Bet placed successfully', 'success');
            await App.loadMarkets();
            
            const balance = await App.state.provider.getBalance(App.state.userAddress);
            WalletComponent.updateWalletInfo(App.state.userAddress, balance, 'Online');
        } catch (error) {
            console.error(error);
            Utils.showNotification('Failed to place bet: ' + error.message, 'error');
        }
    },

    resolveMarket: async (marketId, outcome) => {
        if (!App.state.isOwner) {
            Utils.showNotification('Only contract owner can resolve markets', 'error');
            return;
        }

        const outcomeText = outcome ? 'YES' : 'NO';
        if (!confirm(`Are you sure you want to resolve Market #${marketId} as ${outcomeText}?`)) {
            return;
        }

        try {
            Utils.showNotification('Resolving market...', 'info');
            const tx = await App.state.contract.resolveMarket(marketId, outcome);
            await tx.wait();
            
            Utils.showNotification(`Market resolved as ${outcomeText}`, 'success');
            await App.loadMarkets();
        } catch (error) {
            console.error(error);
            Utils.showNotification('Failed to resolve market: ' + error.message, 'error');
        }
    },

    claimWinnings: async (marketId) => {
        try {
            Utils.showNotification('Claiming winnings...', 'info');
            const tx = await App.state.contract.claimWinnings(marketId);
            await tx.wait();
            
            Utils.showNotification('Winnings claimed successfully', 'success');
            await App.loadMarkets();
            
            const balance = await App.state.provider.getBalance(App.state.userAddress);
            WalletComponent.updateWalletInfo(App.state.userAddress, balance, 'Online');
        } catch (error) {
            console.error(error);
            Utils.showNotification('Failed to claim winnings: ' + error.message, 'error');
        }
    },

    withdrawFees: async () => {
        if (!App.state.isOwner) {
            Utils.showNotification('Only contract owner can withdraw fees', 'error');
            return;
        }

        try {
            Utils.showNotification('Withdrawing fees...', 'info');
            const tx = await App.state.contract.withdrawFees();
            await tx.wait();
            
            Utils.showNotification('Fees withdrawn successfully', 'success');
            await AdminComponent.updateFees();
            
            const balance = await App.state.provider.getBalance(App.state.userAddress);
            WalletComponent.updateWalletInfo(App.state.userAddress, balance, 'Online');
        } catch (error) {
            console.error(error);
            Utils.showNotification('Failed to withdraw fees: ' + error.message, 'error');
        }
    }
};

// Initialize app when DOM is loaded
window.addEventListener('DOMContentLoaded', App.init);