// Utility Functions
const Utils = {
    showNotification: (message, type) => {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 4000);
    },

    formatAddress: (address) => {
        return address.slice(0, 6) + '...' + address.slice(-4);
    },

    formatBalance: (balance) => {
        return parseFloat(ethers.formatEther(balance)).toFixed(2) + ' FLR';
    },

    formatAmount: (amount, decimals = 4) => {
        return parseFloat(ethers.formatEther(amount)).toFixed(decimals);
    },

    formatDate: (timestamp) => {
        return new Date(Number(timestamp) * 1000).toLocaleString();
    }
};