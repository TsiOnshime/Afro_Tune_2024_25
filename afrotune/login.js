document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('remember').checked;

    try {
        const response = await fetch(`${AUTH.SERVER_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                userPassword: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token based on remember me
        if (remember) {
            localStorage.setItem('token', data.accessToken);
        } else {
            sessionStorage.setItem('token', data.accessToken);
        }

        // Get user role and redirect
        const payload = AUTH.parseJwt(data.accessToken);
        switch(payload.role) {
            case 'artist':
                window.location.href = 'artist.html';
                break;
            case 'superadmin':
                window.location.href = 'admin.html';
                break;
            default:
                window.location.href = 'user.html';
        }

    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'Login failed', 'error');
    }
});

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        
        // Validate token expiration
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            throw new Error('Token has expired');
        }

        return payload;
    } catch (error) {
        console.error('Token parsing error:', error);
        throw new Error('Invalid token format');
    }
}

function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2700);
}

// Optional: Add token refresh logic
function checkTokenExpiration() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        try {
            const payload = parseJwt(token);
            const timeUntilExpiry = payload.exp * 1000 - Date.now();
            
            // If token expires in less than 5 minutes, refresh it
            if (timeUntilExpiry < 300000) {
                // Implement token refresh logic here
                console.log('Token needs refresh');
            }
        } catch (error) {
            console.error('Token validation error:', error);
            // Redirect to login if token is invalid
            window.location.href = '/login.html';
        }
    }
}

// Check token expiration periodically
setInterval(checkTokenExpiration, 60000); // Check every minute

// Handle Google login
document.querySelector('.google-btn').addEventListener('click', () => {
    // Implement Google OAuth login here
    console.log('Google login clicked');
});
