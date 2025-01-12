// Function to create and append the song cards
async function generateSongCards() {
    const songCardsContainer = document.getElementById("song-cards");


    
        try {
                        // Fetching the song data from the backend API
            const response = await fetch('http://localhost:3006/api/songs'); // Replace with your actual API URL
            const songs = await response.json();  // Parse the JSON data
    
            // Check if songs are available
            if (!songs || songs.length === 0) {
                songCardsContainer.innerHTML = '<p>No songs available.</p>';
                return;
            }
    
            // Clear the container before adding new songs
            songCardsContainer.innerHTML = '';
    
            // Iterate over the songs array and generate the cards
            songs.forEach(song => {
                // Check if the song is already in the list to avoid duplicates
                const existingSong = document.querySelector(`.song-card[data-id="${song.id}"]`);
                if (!existingSong) {
                    const cardContainer = document.createElement("div");
                    cardContainer.classList.add("song-card");
                    cardContainer.setAttribute("data-id", song.id); // Unique ID for the song
    
                    const card = document.createElement("div");
                    card.classList.add("card");
    
                    const img = document.createElement("img");
                    img.src = song.image;
                    img.alt = song.title;
    
                    const cardContent = document.createElement("div");
                    cardContent.classList.add("card-content");
    
                    const h3 = document.createElement("h3");
                    h3.textContent = song.title;
    
                    const p = document.createElement("p");
                    p.textContent = song.artist;  // Assuming each song has an artist field
    
                    const playButton = document.createElement("button");
                    playButton.classList.add("play-btn");
                    playButton.innerHTML = `<i class='bx bx-play'></i>`;
    
                    playButton.onclick = () => playSong(song, img.src, h3.textContent, p.textContent);
    
                    cardContent.appendChild(h3);
                    cardContent.appendChild(p);
                    cardContent.appendChild(playButton);
    
                    card.appendChild(img);
                    card.appendChild(cardContent);
    
                    cardContainer.appendChild(card);
                    songCardsContainer.appendChild(cardContainer);
                }
            });
        } catch (error) {
            console.error('Error fetching song data:', error);
            songCardsContainer.innerHTML = '<p>Failed to load songs.</p>';
        }
    }
    

// Function to play the selected song
function playSong(song, imageSrc, title, description) {
    const audio = new Audio(song.audio);
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const songTitle = document.getElementById('current-song-title');
    const songArtist = document.getElementById('current-song-artist');
    const songImage = document.getElementById('current-song-image');

    // Update song info on music controls
    songImage.src = imageSrc;
    songTitle.textContent = title;
    songArtist.textContent = description;

    audio.play();
    playIcon.classList.replace('bx-play', 'bx-pause');
    playPauseBtn.setAttribute('onclick', 'pauseSong()');
    
    // Save audio reference to control the playback
    window.currentAudio = audio;
}

// Pause function
function pauseSong() {
    if (window.currentAudio) {
        window.currentAudio.pause();
        const playIcon = document.getElementById('play-icon');
        const playPauseBtn = document.getElementById('play-pause-btn');
        playIcon.classList.replace('bx-pause', 'bx-play');
        playPauseBtn.setAttribute('onclick', 'playSong(window.currentSong, window.currentSongImage, window.currentSongTitle, window.currentSongDescription)');
    }
}

// Function to skip to the next song
function nextSong() {
    // You can implement song index navigation here
}

// Function to skip to the previous song
function prevSong() {
    // You can implement song index navigation here
}

// Event listeners for controls
document.getElementById('next-btn').addEventListener('click', nextSong);
document.getElementById('prev-btn').addEventListener('click', prevSong);

// Initialize the song cards
window.onload = generateSongCards;
