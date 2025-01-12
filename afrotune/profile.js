const SERVER_URL = 'http://localhost:3006';

// Function to handle profile upload
async function handleProfileUpload(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const imageFile = document.getElementById('profileImage').files[0];
    const artist = document.getElementById('artistName').value;
    const bio = document.getElementById('artistBio').value;
    const genre = document.getElementById('artistGenre').value;
    const description = document.getElementById('artistDescription').value;

    // Validate required fields
    if (!imageFile || !artist) {
        showNotification('❌ Artist name and image are required', 'error');
        return;
    }

    // Convert image to base64
    const base64Image = await convertImageToBase64(imageFile);

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${SERVER_URL}/profile/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                artist: artist,
                bio: bio || '',
                genre: genre || '',
                description: description || '',
                imageData: base64Image,
                imageContentType: imageFile.type
            })
        });

        if (response.status === 201) {
            showNotification('✅ Profile updated successfully!', 'success');
            document.getElementById('profileForm').reset();
            await fetchProfile(); // Refresh profile data
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Profile update failed');
        }

    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('❌ ' + error.message, 'error');
    }
}

// Function to fetch profile data
async function fetchProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const email = getUserEmail(); // Get email from token or localStorage
        const response = await fetch(`${SERVER_URL}/profile/${encodeURIComponent(email)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const profileData = await response.json();
            displayProfile(profileData);
        } else {
            throw new Error('Failed to fetch profile');
        }

    } catch (error) {
        console.error('Error fetching profile:', error);
        showNotification('❌ ' + error.message, 'error');
    }
}

// Helper function to convert image to base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Function to display profile data
function displayProfile(data) {
    // Update profile image
    const profileImage = document.getElementById('profileImageDisplay');
    if (profileImage && data.imageContentType) {
        profileImage.src = `${SERVER_URL}/profile/image/${data.email}`;
    }

    // Update text fields
    document.getElementById('artistNameDisplay').textContent = data.artist;
    document.getElementById('artistBioDisplay').textContent = data.bio || 'No bio available';
    document.getElementById('artistGenreDisplay').textContent = data.genre || 'No genre specified';
    document.getElementById('artistDescriptionDisplay').textContent = data.description || 'No description available';
}

// Helper function to get user email from token
function getUserEmail() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.email;
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
}

// Show notification function
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpload);
    }

    // Preview image when selected
    const imageInput = document.getElementById('profileImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Fetch profile data on page load
    fetchProfile();
}); 