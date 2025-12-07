// Market Component
const MarketComponent = {
    renderMarketCard: async (market) => {
        const { id, question, endTime, resolved, outcome, yesStake, noStake } = market;
        
        const now = Math.floor(Date.now() / 1000);
        const ended = now >= Number(endTime);
        
        const yesAmount = Utils.formatAmount(yesStake);
        const noAmount = Utils.formatAmount(noStake);
        const totalPool = parseFloat(yesAmount) + parseFloat(noAmount);
        
        const yesOdds = totalPool > 0 ? ((parseFloat(yesAmount) / totalPool) * 100).toFixed(1) : 50;
        const noOdds = totalPool > 0 ? ((parseFloat(noAmount) / totalPool) * 100).toFixed(1) : 50;

        let statusClass = resolved ? 'status-resolved' : (ended ? 'status-ended' : 'status-active');
        let statusText = resolved ? `Resolved: ${outcome ? 'YES' : 'NO'}` : 
                        (ended ? 'Ended - Awaiting Resolution' : 'Active');

        const endDate = Utils.formatDate(endTime);

        let userPositionHTML = await MarketComponent.renderUserPosition(id, resolved, totalPool, yesStake, noStake);
        let resolveSection = await MarketComponent.renderResolveSection(id, ended, resolved);
        let bettingSection = MarketComponent.renderBettingSection(id, resolved, ended);

        return `
            <div class="market-card">
                <div class="market-header">
                    <div class="market-question">${question}</div>
                    <div class="status-badge ${statusClass}">${statusText}</div>
                </div>
                
                <div class="market-meta">
                    <div class="meta-item">Market #${id}</div>
                    <div class="meta-item">Ends: ${endDate}</div>
                    <div class="meta-item">Pool: ${totalPool.toFixed(4)} FLR</div>
                </div>

                <div class="pool-container">
                    <div class="pool-box pool-yes">
                        <div class="pool-label">YES</div>
                        <div class="pool-amount">${parseFloat(yesAmount).toFixed(4)}</div>
                        <div class="pool-odds">${yesOdds}% of pool</div>
                    </div>
                    <div class="pool-box pool-no">
                        <div class="pool-label">NO</div>
                        <div class="pool-amount">${parseFloat(noAmount).toFixed(4)}</div>
                        <div class="pool-odds">${noOdds}% of pool</div>
                    </div>
                </div>

                ${resolveSection}
                ${userPositionHTML}
                ${bettingSection}
            </div>
        `;
    },

    renderUserPosition: async (marketId, resolved, totalPool, yesStake, noStake) => {
        if (!App.state.userAddress || !App.state.contract) return '';

        try {
            const position = await App.state.contract.getUserPosition(marketId, App.state.userAddress);
            const [userYes, userNo, claimed] = position;
            
            if (userYes === 0n && userNo === 0n) return '';

            let potentialWinningsHTML = '';
            if (!resolved && totalPool > 0) {
                try {
                    if (userYes > 0n) {
                        const yesWinnings = await App.state.contract.calculatePotentialWinnings(
                            marketId, App.state.userAddress, true
                        );
                        potentialWinningsHTML += `
                            <div class="potential-winnings">
                                <div class="potential-winnings-label">If YES wins</div>
                                <div class="potential-winnings-amount">${Utils.formatAmount(yesWinnings)} FLR</div>
                            </div>
                        `;
                    }
                    if (userNo > 0n) {
                        const noWinnings = await App.state.contract.calculatePotentialWinnings(
                            marketId, App.state.userAddress, false
                        );
                        potentialWinningsHTML += `
                            <div class="potential-winnings">
                                <div class="potential-winnings-label">If NO wins</div>
                                <div class="potential-winnings-amount">${Utils.formatAmount(noWinnings)} FLR</div>
                            </div>
                        `;
                    }
                } catch (e) {
                    console.error('Error calculating winnings:', e);
                }
            }

            return `
                <div class="user-position">
                    <h4>Your Position</h4>
                    <div class="position-grid">
                        <div class="info-item">
                            <div class="info-label">YES Stake</div>
                            <div class="info-value">${Utils.formatAmount(userYes)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">NO Stake</div>
                            <div class="info-value">${Utils.formatAmount(userNo)}</div>
                        </div>
                        ${potentialWinningsHTML}
                    </div>
                    ${resolved && !claimed ? `
                        <button class="btn btn-success" style="margin-top: 12px;" 
                                onclick="App.claimWinnings(${marketId})">
                            Claim Winnings
                        </button>
                    ` : ''}
                    ${resolved && claimed ? `
                        <div style="margin-top: 12px; text-align: center; color: #10b981; font-size: 13px;">
                            ✓ Winnings Claimed
                        </div>
                    ` : ''}
                </div>
            `;
        } catch (e) {
            console.error('Error loading position:', e);
            return '';
        }
    },

    renderResolveSection: async (marketId, ended, resolved) => {
        if (!App.state.isOwner || !ended || resolved) return '';

        return `
            <div class="resolve-section">
                <h4>⚠️ Resolve Market (Owner Only)</h4>
                <div class="btn-group">
                    <button class="btn btn-success btn-small" 
                            onclick="App.resolveMarket(${marketId}, true)">
                        Resolve as YES
                    </button>
                    <button class="btn btn-danger btn-small" 
                            onclick="App.resolveMarket(${marketId}, false)">
                        Resolve as NO
                    </button>
                </div>
            </div>
        `;
    },

    renderBettingSection: (marketId, resolved, ended) => {
        if (resolved || ended) return '';

        return `
            <div class="bet-section">
                <input type="number" class="bet-input" id="betAmount${marketId}" 
                       placeholder="Amount in FLR" step="0.01" min="0.01" value="0.1">
                <button class="btn btn-success" onclick="App.placeBet(${marketId}, true)">Bet YES</button>
                <button class="btn btn-danger" onclick="App.placeBet(${marketId}, false)">Bet NO</button>
            </div>
        `;
    }
};