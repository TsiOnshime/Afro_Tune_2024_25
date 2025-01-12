const SERVER_URL = 'http://localhost:3006';

// Check if already logged in
function checkLoginState() {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = parseJwt(token);
        if (payload && payload.role) {
            routeBasedOnRole(payload.role);
            return true;
        }
    }
    return false;
}

// Function to handle login
async function handleLogin(email, password) {
    try {
        const response = await fetch(`${SERVER_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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

        // Store token
        const token = data.token || data.accessToken;
        localStorage.setItem('token', token);

        // Route based on role
        const payload = parseJwt(token);
        if (payload && payload.role) {
            routeBasedOnRole(payload.role);
        } else {
            throw new Error('Invalid token');
        }

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Route based on user role
function routeBasedOnRole(role) {
    let targetPage;

    switch(role) {
        case 'superadmin':
            targetPage = 'admin.html';
            break;
        case 'artist':
            targetPage = 'artist.html';
            break;
        case 'user':
            targetPage = 'index.html';
            break;
        default:
            targetPage = 'index.html';
    }

    window.location.href = targetPage;
}

// Parse JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

// Show notification
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

// Function to handle signup
async function handleSignup(e) {
    e.preventDefault();

    try {
        const formData = {
            email: document.getElementById('signupEmail').value.trim(),
            userPassword: document.getElementById('signupPassword').value,
            fullName: document.getElementById('signupFullName').value.trim(),
            dateOfBirth: document.getElementById('signupDateOfBirth').value,
            gender: document.getElementById('signupGender').value
        };

        if (!formData.email || !formData.userPassword || !formData.fullName || !formData.dateOfBirth || !formData.gender) {
            throw new Error('Please fill in all fields');
        }

        const response = await fetch(`${SERVER_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.status === 201) {
            showNotification('✅ Registration successful!', 'success');
            
            // If the API returns a token and role, use them
            if (data.token) {
                localStorage.setItem('token', data.token);
                const payload = parseJwt(data.token);
                if (payload && payload.role) {
                    routeBasedOnRole(payload.role);
                    return;
                }
            }
            
            // If no token/role, redirect to index.html (default user page)
            window.location.href = 'index.html';
        } else {
            throw new Error(data.message || 'Registration failed');
        }

    } catch (error) {
        console.error('Registration error:', error);
        showNotification('❌ ' + error.message, 'error');
    }
}

// Update the form toggle function
function toggleForms(formToShow) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (formToShow === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }
}

// Initialize forms
document.addEventListener('DOMContentLoaded', () => {
    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await handleLogin(email, password);
        });
    }

    // Signup form handler
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}); 