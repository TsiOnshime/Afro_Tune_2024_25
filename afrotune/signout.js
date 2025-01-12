// Function to handle sign out
function handleSignOut() {
    try {
        // Show notification
        showNotification('👋 Signing out...', 'success');
        
        // Redirect to signout page
        setTimeout(() => {
            window.location.href = 'signout.html';
        }, 500);
    } catch (error) {
        showNotification('❌ Error signing out', 'error');
    }
}

// Add event listener to sign out button
document.addEventListener('DOMContentLoaded', () => {
    // Get the sign out button with class dark-badge
    const signOutBtns = Array.from(document.getElementsByClassName('dark-badge')).filter(btn => 
        btn.textContent.includes('Sign Out')
    );

    signOutBtns.forEach(btn => {
        btn.addEventListener('click', handleSignOut);
    });
});

// Show notification function if not already defined
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} notification-slide-in`;
    notification.innerHTML = `
        <div class="notification-content">
            ${message}
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('notification-slide-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 