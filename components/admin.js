// Admin Component
const AdminComponent = {
    render: () => {
        return `
            <div class="divider"></div>
            <h3>Admin Controls</h3>
            <div class="info-item" style="margin: 12px 0;">
                <div class="info-label">Collected Fees</div>
                <div class="info-value" id="collectedFees">0.0 FLR</div>
            </div>
            <button class="btn btn-warning" onclick="App.withdrawFees()">Withdraw Fees</button>
        `;
    },

    updateFees: async () => {
        if (!App.state.contract || !App.state.isOwner) return;
        
        try {
            const fees = await App.state.contract.collectedFees();
            document.getElementById('collectedFees').textContent = 
                Utils.formatAmount(fees) + ' FLR';
        } catch (e) {
            console.error('Error fetching fees:', e);
        }
    }
};
