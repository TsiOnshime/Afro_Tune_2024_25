const SERVER_URL = 'http://localhost:3006';

// Function to handle profile form submission
async function handleProfileSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const artist = document.getElementById('artist').value;
    const bio = document.getElementById('bio').value;
    const genre = document.getElementById('genre').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];

    // Validate required fields
    if (!artist || !imageFile) {
        showNotification('❌ Artist name and image are required', 'error');
        return;
    }

    try {
        // Convert image to base64
        const imageData = await convertImageToBase64(imageFile);
        
        // Prepare request body
        const profileData = {
            artist: artist,
            bio: bio,
            genre: genre,
            description: description,
            imageData: imageData,
            imageContentType: imageFile.type
        };

        // Send request
        const token = localStorage.getItem('token');
        const response = await fetch(`${SERVER_URL}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        if (response.status === 201) {
            showNotification('✅ Profile updated successfully', 'success');
            document.getElementById('profile-form').reset();
            // Refresh profile display if it exists
            if (typeof fetchArtistProfile === 'function') {
                fetchArtistProfile();
            }
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Failed to update profile');
        }

    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('❌ ' + error.message, 'error');
    }
}

// Helper function to convert image to base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Extract base64 data without the prefix
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
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

// Initialize form handler
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    // Preview image when selected
    const imageInput = document.getElementById('image');
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
}); 