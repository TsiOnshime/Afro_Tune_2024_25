// Function to create and append the song cards
async function generateSongCards() {
    const songCardsContainer = document.getElementById("song-cards");

    try {
        // Fetching the song data from the backend API
        const response = await fetch('http://localhost:3006/songs'); // Replace with your actual API URL
        const songs = await response.json(); // Parse the JSON data

        // Check if songs are available
        if (!songs || songs.length === 0) {
            songCardsContainer.innerHTML = '<p>No songs available.</p>';
            return;
        }

        // Iterate over the songs array and generate the cards
        songs.forEach(song => {
            const cardContainer = document.createElement("div");
            cardContainer.classList.add("card-container");

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
            p.textContent = song.description;

            // Additional fields: artist, genre, release date
            const artist = document.createElement("p");
            artist.textContent = `Artist: ${song.artist || "Unknown"}`;

            const genre = document.createElement("p");
            genre.textContent = `Genre: ${song.genre || "Unknown"}`;

            const releaseDate = document.createElement("p");
            releaseDate.textContent = `Release Date: ${song.releaseDate || "N/A"}`;

            const playButton = document.createElement("a");
            playButton.href = song.audio;
            playButton.classList.add("btn");
            playButton.textContent = "Play";

            // Append all elements to the card content
            cardContent.appendChild(h3);
            cardContent.appendChild(p);
            cardContent.appendChild(artist);
            cardContent.appendChild(genre);
            cardContent.appendChild(releaseDate);
            cardContent.appendChild(playButton);

            // Add image and card content to the card
            card.appendChild(img);
            card.appendChild(cardContent);

            // Add card to the card container
            cardContainer.appendChild(card);

            // Add card container to the main song cards container
            songCardsContainer.appendChild(cardContainer);
        });
    } catch (error) {
        console.error('Error fetching song data:', error);
        songCardsContainer.innerHTML = '<p>Failed to load songs.</p>';
    }
}

// Call the function to generate cards when the page loads
window.onload = generateSongCards;
