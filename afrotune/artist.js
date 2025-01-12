const SERVER_URL = 'http://localhost:3006';
let allSongs = [];

// Constants for file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const songsContainer = document.getElementById('songs-container');
    const artistNameElement = document.querySelector('.artist-name');
    const currentArtistName = artistNameElement.textContent;

    // Load artist's songs when page loads
    loadArtistSongs(currentArtistName);

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form elements
        const titleInput = document.getElementById('title');
        const albumInput = document.getElementById('album');
        const genreInput = document.getElementById('genre');
        const descriptionInput = document.getElementById('description');
        const songFileInput = document.getElementById('songFile');
        const imageFileInput = document.getElementById('coverImage');

        // Validate inputs
        if (!titleInput.value.trim()) {
            showNotification('Please enter a title', 'error');
            return;
        }

        // Validate song file
        const songFile = songFileInput.files[0];
        if (!songFile) {
            showNotification('Please select a song file', 'error');
            return;
        }

        if (!ALLOWED_AUDIO_TYPES.includes(songFile.type)) {
            showNotification('Please select a valid MP3 file', 'error');
            return;
        }

        if (songFile.size > MAX_FILE_SIZE) {
            showNotification('Song file size must be less than 10MB', 'error');
            return;
        }

        // Validate image file
        const imageFile = imageFileInput.files[0];
        if (!imageFile) {
            showNotification('Please select a cover image', 'error');
            return;
        }

        if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
            showNotification('Please select a valid image file (JPEG or PNG)', 'error');
            return;
        }

        if (imageFile.size > MAX_FILE_SIZE) {
            showNotification('Image file size must be less than 10MB', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('title', titleInput.value.trim());
        formData.append('artist', currentArtistName);
        formData.append('album', albumInput.value.trim());
        formData.append('genre', genreInput.value.trim());
        formData.append('description', descriptionInput.value.trim());
        formData.append('song', songFile);
        formData.append('image', imageFile);

        const uploadButton = document.querySelector('button[type="submit"]');
        const originalButtonText = uploadButton.textContent;

        try {
            uploadButton.disabled = true;
            uploadButton.textContent = 'Uploading...';
            showNotification('Uploading song...', 'info');

            const response = await fetch(`${SERVER_URL}/songs/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Upload failed: ${response.status}`);
            }

            showNotification('Song uploaded successfully!');
            uploadForm.reset();
            await loadArtistSongs(currentArtistName);

        } catch (error) {
            console.error('Upload error:', error);
            showNotification(
                error.message || 'Failed to upload song. Please try again.', 
                'error'
            );
        } finally {
            uploadButton.disabled = false;
            uploadButton.textContent = originalButtonText;
        }
    });

    async function loadArtistSongs(artistName) {
        try {
            songsContainer.innerHTML = '<div class="loading">Loading songs...</div>';
            
            const response = await fetch(`${SERVER_URL}/songs/artist/${encodeURIComponent(artistName)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch songs');
            }
            const songs = await response.json();
            allSongs = songs;
            displaySongs(songs);
        } catch (error) {
            console.error('Error loading songs:', error);
            showNotification('Failed to load songs', 'error');
            songsContainer.innerHTML = '<div class="error">Failed to load songs</div>';
        }
    }

    function displaySongs(songs) {
        if (!Array.isArray(songs) || songs.length === 0) {
            songsContainer.innerHTML = '<p class="no-songs">No songs uploaded yet</p>';
            return;
        }

        const songsHTML = songs.map((song, index) => `
            <div class="card" data-song-index="${index}">
                <img src="${SERVER_URL}/songs/image/${song._id}" 
                     alt="${song.title}" 
                     class="card-img"
                     onerror="this.src='./images/default-cover.jpg'">
                <div class="card-content">
                    <p class="card-title">${song.title}</p>
                    <p class="card-info">${song.artist} • ${song.album || 'Unknown Album'}</p>
                    <button class="play-button" onclick="playSong(${index})">
                        <i class="fa-sharp fa-solid fa-circle-play"></i>
                    </button>
                </div>
            </div>
        `).join('');

        songsContainer.innerHTML = songsHTML;

        // Add double-click handlers
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('dblclick', () => {
                const index = parseInt(card.dataset.songIndex);
                playSong(index);
            });
        });
    }

    // Add profile form handler
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', uploadProfile);
    }

    // Add image preview functionality
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

    // Initialize profile form and fetch profile
    initializeProfileForm();
    fetchArtistProfile();
});

// Global functions
function playSong(index) {
    const song = allSongs[index];
    if (!song) return;

    const audioPlayer = document.getElementById('audio-player');
    const previousSrc = audioPlayer.src;
    
    audioPlayer.src = `${SERVER_URL}/songs/stream/${song._id}`;
    audioPlayer.play()
        .then(() => {
            document.getElementById('current-song-title').textContent = song.title;
            document.getElementById('current-song-artist').textContent = song.artist;
            
            // Update play button states
            document.querySelectorAll('.play-button i').forEach(icon => {
                icon.className = 'fa-sharp fa-solid fa-circle-play';
            });
            const currentButton = document.querySelector(`[data-song-index="${index}"] .play-button i`);
            if (currentButton) {
                currentButton.className = 'fa-sharp fa-solid fa-circle-pause';
            }
        })
        .catch(error => {
            console.error('Error playing song:', error);
            showNotification('Error playing song', 'error');
            audioPlayer.src = previousSrc;
        });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add this CSS to your stylesheet
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 4px;
    color: white;
    z-index: 1000;
    animation: slideIn 0.5s ease;
}

.notification.success { background-color: #4CAF50; }
.notification.error { background-color: #f44336; }
.notification.info { background-color: #2196F3; }

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
}

.error {
    text-align: center;
    padding: 20px;
    color: #f44336;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;
document.head.appendChild(style);

// Function to get logged in user's email from token
function getLoggedInUserEmail() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.email;
    } catch (error) {
        console.error('Error getting user email:', error);
        return null;
    }
}

// Function to handle profile upload
async function uploadProfile(event) {
    event.preventDefault();
    console.log('Starting profile upload...');

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const email = getLoggedInUserEmail();
        if (!email) {
            throw new Error('User email not found');
        }

        // Get form values
        const formData = new FormData();
        formData.append('artist', document.getElementById('artistName').value);
        formData.append('bio', document.getElementById('artistBio').value || 'No bio available');  // Default value
        formData.append('genre', document.getElementById('artistGenre').value || 'Unknown');  // Default value
        formData.append('description', document.getElementById('artistDescription').value || '');
        formData.append('imageData', document.getElementById('profileImage').files[0]);
        formData.append('imageContentType', document.getElementById('profileImage').files[0].type.split('/')[1]);

        // First try POST request
        let response = await fetch(`${SERVER_URL}/profile/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        // If profile exists, switch to PUT request
        if (response.status === 400) {
            const errorData = await response.json();
            if (errorData.message.includes('Artist already has a profile')) {
                formData.append('email', email);
                response = await fetch(`${SERVER_URL}/profile/updateprofile/${encodeURIComponent(email)}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
            }
        }

        const responseData = await response.json();

        if (response.status === 201 || response.status === 200) {
            showNotification('✅ Profile updated successfully!', 'success');
            document.getElementById('profileForm').reset();
            
            // Clear image preview
            const imagePreview = document.getElementById('imagePreview');
            if (imagePreview) {
                imagePreview.style.display = 'none';
                imagePreview.src = '';
            }
            
            // Refresh profile display
            await fetchArtistProfile();
        } else {
            throw new Error(responseData.message || 'Failed to update profile');
        }

    } catch (error) {
        console.error('Profile upload error:', error);
        showNotification('❌ ' + error.message, 'error');
    }
}

// Function to check if profile exists
async function checkProfileExists() {
    try {
        const email = getLoggedInUserEmail();
        const response = await fetch(`${SERVER_URL}/profile/${email}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Error checking profile:', error);
        return false;
    }
}

// Function to create new profile
async function createProfile(event) {
    event.preventDefault();
    console.log('Creating new profile...');

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Get form values and create FormData
        const formData = new FormData();
        formData.append('artist', document.getElementById('artistName').value);
        formData.append('bio', document.getElementById('artistBio').value || '');
        formData.append('genre', document.getElementById('artistGenre').value || '');
        formData.append('description', document.getElementById('artistDescription').value || '');
        formData.append('imageData', document.getElementById('profileImage').files[0]);
        formData.append('imageContentType', document.getElementById('profileImage').files[0].type.split('/')[1]);

        const response = await fetch(`${SERVER_URL}/profile/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        handleProfileResponse(response);
    } catch (error) {
        handleProfileError(error);
    }
}

// Function to update existing profile
async function updateProfile(event) {
    event.preventDefault();
    console.log('Updating profile...');

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const email = getLoggedInUserEmail();
        if (!email) {
            throw new Error('User email not found');
        }

        // Get form values
        const imageFile = document.getElementById('profileImage').files[0];
        let imageData = '';
        let imageContentType = '';

        // Only process image if a new one is selected
        if (imageFile) {
            imageData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(imageFile);
            });
            imageContentType = imageFile.type.split('/')[1];
        }

        const profileData = {
            artist: document.getElementById('artistName').value,
            bio: document.getElementById('artistBio').value || '',
            genre: document.getElementById('artistGenre').value || '',
            description: document.getElementById('artistDescription').value || '',
            imageData: imageData,
            imageContentType: imageContentType
        };

        const response = await fetch(`${SERVER_URL}/profile/updateprofile/${encodeURIComponent(email)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        handleProfileResponse(response);
    } catch (error) {
        handleProfileError(error);
    }
}

// Helper function to handle profile response
async function handleProfileResponse(response) {
    if (response.status === 201 || response.status === 200) {
        const data = await response.json();
        showNotification('✅ ' + (data.message || 'Profile updated successfully'), 'success');
        document.getElementById('profileForm').reset();
        
        // Clear image preview
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.style.display = 'none';
            imagePreview.src = '';
        }
        
        // Refresh the profile display
        if (typeof fetchArtistProfile === 'function') {
            await fetchArtistProfile();
        }
    } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
    }
}

// Helper function to handle profile errors
function handleProfileError(error) {
    console.error('Profile error:', error);
    showNotification('❌ ' + error.message, 'error');
}

// Initialize form handler with profile check
document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        const hasProfile = await checkProfileExists();
        profileForm.addEventListener('submit', hasProfile ? updateProfile : createProfile);
    }
});

// Function to fetch and display artist profile
async function fetchArtistProfile() {
    try {
        const email = getLoggedInUserEmail();
        if (!email) {
            throw new Error('User email not found');
        }

        // Fetch profile data
        const response = await fetch(`${SERVER_URL}/profile/${encodeURIComponent(email)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const profileData = await response.json();
            console.log('Profile data:', profileData);
           
            // Update profile image using binary data from response
            const profilePic = document.getElementById('profilePic');
            if (profilePic && profileData.imageData) {
                // Convert Buffer data to Blob
                const uint8Array = new Uint8Array(profileData.imageData.data);
                const blob = new Blob([uint8Array], { type: `image/${profileData.imageContentType}` });
                const imageUrl = URL.createObjectURL(blob);
                profilePic.src = imageUrl;
                
                // Clean up the object URL when the image loads
                profilePic.onload = () => {
                    URL.revokeObjectURL(imageUrl);
                };
            }

            // Update artist name
            const artistName = document.querySelector('.artist-name');
            if (artistName) {
                artistName.textContent = profileData.artist;
            }

            // Update artist bio
            const artistBio = document.querySelector('.artist-bio');
            if (artistBio) {
                artistBio.textContent = profileData.bio;
            }

            // Update artist genre
            const artistType = document.querySelector('.artist-type');
            if (artistType) {
                artistType.textContent = profileData.genre;
            }

            // Load artist's songs if available
            if (profileData.artist) {
                await loadArtistSongs(profileData.artist);
            }
        } else {
            throw new Error('Failed to fetch profile');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        showNotification('❌ Error loading profile', 'error');
    }
}

// Function to initialize profile form
async function initializeProfileForm() {
    try {
        const email = getLoggedInUserEmail();
        const response = await fetch(`${SERVER_URL}/profile/${encodeURIComponent(email)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const profileForm = document.getElementById('profileForm');
        const createBtn = document.querySelector('.create-profile');
        const updateBtn = document.querySelector('.update-profile');

        if (response.ok) {
            // Profile exists - show update button and populate form
            const profileData = await response.json();
            populateProfileForm(profileData);
            profileForm.removeEventListener('submit', createProfile);
            profileForm.addEventListener('submit', updateProfile);
            if (createBtn) createBtn.style.display = 'none';
            if (updateBtn) updateBtn.style.display = 'block';
        } else {
            // No profile - show create button
            profileForm.removeEventListener('submit', updateProfile);
            profileForm.addEventListener('submit', createProfile);
            if (createBtn) createBtn.style.display = 'block';
            if (updateBtn) updateBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error initializing profile form:', error);
        showNotification('❌ Error loading profile', 'error');
    }
}

// Function to populate form with existing profile data
function populateProfileForm(profileData) {
    document.getElementById('artistName').value = profileData.artist || '';
    document.getElementById('artistBio').value = profileData.bio || '';
    document.getElementById('artistGenre').value = profileData.genre || '';
    document.getElementById('artistDescription').value = profileData.description || '';
}

// Update your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // ... your existing code ...

    // Initialize profile form and fetch profile
    initializeProfileForm();
    fetchArtistProfile();
}); 