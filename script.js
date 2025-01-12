const SERVER_URL = 'http://localhost:3006';

let allSongs = [];
let searchResults = [];
let currentSong = null;
let isPlaying = false;
let currentSongIndex = -1;
let shuffleEnabled = false;
let originalPlaylist = [];
let currentPlaylist = [];

// Audio Controls
function initializeAudioControls() {
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('song-progress');
    const volumeBar = document.querySelector('.volume-bar');
const currentTimeSpan = document.getElementById('current-time');
const totalTimeSpan = document.getElementById('total-time');

    // Play/Pause
    playPauseBtn.addEventListener('click', togglePlayPause);

    // Progress Bar
    audioPlayer.addEventListener('timeupdate', () => {
        if (!audioPlayer.duration) return;
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;
        currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
    });

    progressBar.addEventListener('input', (e) => {
        const time = (progressBar.value * audioPlayer.duration) / 100;
        audioPlayer.currentTime = time;
    });

    // Volume Control
    volumeBar.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value / 100;
    });

    // Duration Update
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeSpan.textContent = formatTime(audioPlayer.duration);
    });

    // Next/Previous
    document.getElementById('next-btn').addEventListener('click', playNext);
    document.getElementById('prev-btn').addEventListener('click', playPrevious);

    // Add shuffle button listener
    const shuffleBtn = document.getElementById('shuffle-btn');
    shuffleBtn.addEventListener('click', toggleShuffle);

    // Add ended event to auto-play next song
    audioPlayer.addEventListener('ended', () => {
        playNext();
    });
}

function togglePlayPause() {
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.className = 'fa-solid fa-pause';
        isPlaying = true;
    } else {
        audioPlayer.pause();
        playPauseBtn.className = 'fa-solid fa-play';
        isPlaying = false;
    }
}

function playNext() {
    const playlist = shuffleEnabled ? currentPlaylist : allSongs;
    if (currentSongIndex < playlist.length - 1) {
        playSong(currentSongIndex + 1);
    } else {
        // Loop back to first song
        playSong(0);
    }
}

function playPrevious() {
    const playlist = shuffleEnabled ? currentPlaylist : allSongs;
    if (currentSongIndex > 0) {
        playSong(currentSongIndex - 1);
    } else {
        // Loop to last song
        playSong(playlist.length - 1);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Fetch songs function
async function fetchSongs() {
    try {
        const response = await fetch(`${SERVER_URL}/songs`);
        if (!response.ok) {
            throw new Error('Failed to fetch songs');
        }
        const songs = await response.json();
        allSongs = songs;
        displaySongs(songs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        document.getElementById('song-cards').innerHTML = 
            '<p class="error-message">Failed to load songs. Please try again later.</p>';
    }
}

// Display songs function
function displaySongs(songs) {
    const songCardsContainer = document.getElementById('song-cards');
    songCardsContainer.innerHTML = '';

    if (!songs || songs.length === 0) {
        songCardsContainer.innerHTML = '<p class="no-songs">No songs available</p>';
        return;
    }

    const songsHTML = songs.map((song, index) => `
        <div class="card" data-song-index="${index}">
            <img src="${SERVER_URL}/songs/image/${song._id}" 
                 alt="${song.title}" 
                 class="card-img"
                 onerror="this.src='./assets/default-cover.jpg'">
            <p class="card-title">${song.title}</p>
            <p class="card-info">${song.artist} • ${song.album || 'Unknown Album'}</p>
            <i class="fa-sharp fa-solid fa-circle-play" onclick="playSong(${index})"></i>
        </div>
    `).join('');

    songCardsContainer.innerHTML = songsHTML;
}

// Search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResultsSection = document.getElementById('search-results-section');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            searchResultsSection.style.display = 'none';
            return;
        }

        const filteredSongs = allSongs.filter(song => 
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm) ||
            (song.album && song.album.toLowerCase().includes(searchTerm))
        );

        searchResultsSection.style.display = 'block';
        displaySearchResults(filteredSongs);
    });
}

// Display search results
function displaySearchResults(songs) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    if (songs.length === 0) {
        searchResults.innerHTML = '<p class="no-results">No songs found</p>';
        return;
    }

    songs.forEach((song, index) => {
        const card = `
            <div class="card" data-song-index="${index}">
                <img src="${SERVER_URL}/songs/image/${song._id}" 
                     alt="${song.title}" 
                     class="card-img"
                     onerror="this.src='./assets/default-cover.jpg'">
                <p class="card-title">${song.title}</p>
                <p class="card-info">${song.artist} • ${song.album || 'Unknown Album'}</p>
                <i class="fa-sharp fa-solid fa-circle-play" onclick="playSong(${index}, true)"></i>
            </div>
        `;
        searchResults.innerHTML += card;
    });
}

// Update playSong function
function playSong(index, isSearchResult = false) {
    const playlist = shuffleEnabled ? currentPlaylist : allSongs;
    const song = playlist[index];
    
    if (!song) return;

    currentSongIndex = index;
    currentSong = song;

    const audioPlayer = document.getElementById('audio-player');
    const currentSongImg = document.getElementById('current-song-img');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongArtist = document.getElementById('current-song-artist');
    const playPauseBtn = document.getElementById('play-pause-btn');
    
    audioPlayer.src = `${SERVER_URL}/songs/stream/${song._id}`;
    currentSongImg.src = `${SERVER_URL}/songs/image/${song._id}`;
    currentSongTitle.textContent = song.title;
    currentSongArtist.textContent = song.artist;

    audioPlayer.play()
        .then(() => {
            playPauseBtn.className = 'fa-solid fa-pause';
            isPlaying = true;
        })
        .catch(error => {
            console.error('Error playing song:', error);
        });
}

// Add shuffle function
function toggleShuffle() {
    const shuffleBtn = document.getElementById('shuffle-btn');
    shuffleEnabled = !shuffleEnabled;
    
    if (shuffleEnabled) {
        shuffleBtn.style.color = '#1da1f2';
        // Save original playlist and create shuffled version
        originalPlaylist = [...allSongs];
        currentPlaylist = [...allSongs];
        shuffleArray(currentPlaylist);
        
        // Find current song's new position
        if (currentSong) {
            currentSongIndex = currentPlaylist.findIndex(song => song._id === currentSong._id);
        }
    } else {
        shuffleBtn.style.color = '#b3b3b3';
        // Restore original playlist
        currentPlaylist = [...originalPlaylist];
        if (currentSong) {
            currentSongIndex = currentPlaylist.findIndex(song => song._id === currentSong._id);
        }
    }
}

// Add shuffle array function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to handle login and routing
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

        // Store the token
        localStorage.setItem('token', data.accessToken);

        // Get user role from token
        const payload = parseJwt(data.accessToken);
        
        // Route based on role
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

    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message, 'error');
    }
}

// Helper function to parse JWT
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
}

// Show notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add event listener to login form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await handleLogin(email, password);
        });
    }
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    fetchSongs();
    setupSearch();
    initializeAudioControls();
});