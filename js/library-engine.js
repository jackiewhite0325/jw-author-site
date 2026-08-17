// Centralized Database for All Authors under Sigil and Scribe LLC
const libraryMasterCatalog = [
    {
        title: "Muffin Gets the Wiggles",
        author: "J. White",
        dewey: "813.6", // American Fiction / Children's Literature classification
        genre: "Children's Books",
        seriesName: "The Muffin the Pitbull Puppy series",
        volume: 1,
        summary: "Follow the charming first adventures of Muffin the Pitbull puppy."
    },
    {
        title: "The Bingo Card of Chronic Illness",
        author: "J. White",
        dewey: "616.09", // Medicine & Health Chronic Diseases classification
        genre: "Health & Wellness",
        seriesName: "None",
        volume: 0,
        summary: "An honest read offering grace and vulnerability while managing ongoing chronic conditions."
    },
    {
        title: "Don't Quote Me: Smart Mouths",
        author: "J. White",
        dewey: "818.6", // Miscellaneous American Literature / Sayings
        genre: "More Books",
        seriesName: "Quote Journeys",
        volume: 1,
        summary: "A beautifully curated collection of wit, smart expressions, and interactive drawing paths."
    }
];

// Handles Opening Content for the Interactive Desk Items & Wall Art
function openParchment(title, contents) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalContent').innerHTML = `<p>${contents}</p>`;
    document.getElementById('parchmentModal').classList.add('modal-active');
}

function closeParchment() {
    document.getElementById('parchmentModal').classList.remove('modal-active');
}

// Old-Fashioned Card Catalog Search & Highlight Logic
document.getElementById('catalogSearch').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const resultsContainer = document.getElementById('catalogResults');
    resultsContainer.innerHTML = ''; // Reset views
    
    if(!query) return;

    // Filter books matching Title, Author, or Genre rules
    const matches = libraryMasterCatalog.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)
    );

    matches.forEach(book => {
        const item = document.createElement('div');
        item.style.padding = "5px";
        item.style.borderBottom = "1px solid #5c4033";
        item.style.cursor = "pointer";
        
        // Print Card with Dewey Classification and Series Tracking
        item.innerHTML = `
            <strong>[Dewey: ${book.dewey}]</strong> ${book.title}<br>
            <small>By ${book.author} | ${book.seriesName ? `Vol ${book.volume} of ${book.seriesName}` : 'Standalone'}</small>
        `;
        
        // When a user selects a book card, highlight it inside the room
        item.onclick = () => {
            openParchment(`${book.title} (Class ${book.dewey})`, `
                <strong>Author:</strong> ${book.author}<br>
                <strong>Genre Hierarchy:</strong> ${book.genre}<br>
                <strong>Series Ordering:</strong> ${book.seriesName} (Volume ${book.volume})<br><br>
                <em>${book.summary}</em>
            `);
        };
        resultsContainer.appendChild(item);
    });
});
