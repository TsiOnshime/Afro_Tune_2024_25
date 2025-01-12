const SERVER_URL = 'http://localhost:3006';

// Initialize admin page
document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
});

async function initializeAdmin() {
    try {
        setupTabs();
        await loadUsers();
        setupArtistForm();
        setupRoleChangeForm();
        setupSearch();
    } catch (error) {
        showNotification('�� Error initializing admin panel: ' + error.message, 'error');
    }
}

// Load all users
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${SERVER_URL}/auth`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch users');
        }

        // Check if data.users exists and is an array
        if (data.users && Array.isArray(data.users)) {
            displayUsers(data.users);
            showNotification('👥 Users loaded successfully', 'success');
        } else {
            throw new Error('Invalid data format received');
        }
    } catch (error) {
        showNotification('❌ ' + error.message, 'error');
    }
}

// Register new artist
async function registerArtist() {
    try {
        const token = localStorage.getItem('token');
        const formData = {
            email: document.getElementById('email').value,
            userPassword: document.getElementById('password').value,
            fullName: document.getElementById('fullName').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            gender: document.getElementById('gender').value
        };

        const response = await fetch(`${SERVER_URL}/auth/register-artist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to register artist');
        }

        showNotification('🎵 Artist registered successfully!', 'success');
        document.getElementById('artistForm').reset();
        await loadUsers(); // Refresh the list
    } catch (error) {
        showNotification('❌ ' + error.message, 'error');
    }
}

// Delete user function
async function deleteUser(userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${SERVER_URL}/auth/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 204) {
            showNotification('👤 User deleted successfully', 'success');
            await loadUsers(); // Refresh the list
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete user');
        }
    } catch (error) {
        showNotification('❌ ' + error.message, 'error');
    }
}

// Change user role
async function changeUserRole(userId, newRole) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${SERVER_URL}/auth/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: userId,
                newRole: newRole
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update role');
        }

        showNotification('🔄 ' + data.message, 'success');
        await loadUsers();
        closeModal();
    } catch (error) {
        showNotification('❌ ' + error.message, 'error');
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.fullName || 'N/A'}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td class="action-buttons">
                ${user.role !== 'superadmin' ? `
                    <button class="btn edit-btn" onclick="openRoleModal('${user.userId}', '${user.role}')">
                        <i class="fas fa-edit"></i> Edit Role
                    </button>
                    <button type="button" class="btn delete-btn" onclick="deleteUser('${user.userId}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : '<span class="admin-badge">Super Admin</span>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// UI Helper Functions
function setupTabs() {
    const tabs = document.querySelectorAll('.nav-links li[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        if (!tab.classList.contains('sign-out-btn')) {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const contentId = `${tab.dataset.tab}-tab`;
                document.getElementById(contentId)?.classList.add('active');
            });
        }
    });
}

function setupSearch() {
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#usersTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

function setupArtistForm() {
    const artistForm = document.getElementById('artistForm');
    if (artistForm) {
        artistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await registerArtist();
        });
    }
}

function setupRoleChangeForm() {
    const roleForm = document.getElementById('roleForm');
    if (roleForm) {
        roleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const modal = document.getElementById('roleModal');
            const userId = modal.dataset.userId;
            const newRole = document.getElementById('newRole').value;
            
            if (!userId || !newRole) {
                showNotification('❌ Invalid role change data', 'error');
                return;
            }

            await changeUserRole(userId, newRole);
        });
    }
}

function openRoleModal(userId, currentRole) {
    const modal = document.getElementById('roleModal');
    const roleSelect = document.getElementById('newRole');
    if (modal && roleSelect) {
        modal.classList.add('active');
        modal.dataset.userId = userId;
        roleSelect.value = currentRole;
    }
}

function closeModal() {
    const modal = document.getElementById('roleModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Enhanced notification function with animation
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} notification-slide-in`;
    notification.innerHTML = `
        <div class="notification-content">
            ${message}
        </div>
    `;
    document.body.appendChild(notification);

    // Add animation
    setTimeout(() => {
        notification.classList.add('notification-slide-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 