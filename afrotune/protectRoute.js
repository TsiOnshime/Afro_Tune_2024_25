function protectRoute(allowedRoles = []) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const payload = parseJwt(token);
        if (!payload || !allowedRoles.includes(payload.role)) {
            window.location.href = 'login.html';
            return;
        }
        return payload;
    } catch (error) {
        window.location.href = 'login.html';
    }
}

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

// Use this on each protected page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'admin.html':
            protectRoute(['superadmin']);
            break;
        case 'artist.html':
            protectRoute(['artist']);
            break;
        case 'index.html':
            protectRoute(['superadmin', 'artist', 'user']);
            break;
        case 'login.html':
            // Check if already logged in
            const token = localStorage.getItem('token');
            if (token) {
                const payload = parseJwt(token);
                if (payload) {
                    switch(payload.role) {
                        case 'superadmin':
                            window.location.href = 'admin.html';
                            break;
                        case 'artist':
                            window.location.href = 'artist.html';
                            break;
                        default:
                            window.location.href = 'index.html';
                    }
                }
            }
            break;
    }
}); 