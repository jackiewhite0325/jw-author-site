// Centralized Database for All Authors under Sigil and Scribe LLC
const libraryMasterCatalog = [
    {
        title: "Muffin Gets the Wiggles",
        author: "J. White",
        dewey: "813.6", 
        genre: "Children's Books",
        seriesName: "The Muffin the Pitbull Puppy series",
        volume: 1,
        summary: "Follow the charming first adventures of Muffin the Pitbull puppy.",
        // 3D Target: Facing the Left Bookshelf wall coordinates
        cameraYRotation: 90 
    },
    {
        title: "The Bingo Card of Chronic Illness",
        author: "J. White",
        dewey: "616.09", 
        genre: "Health & Wellness",
        seriesName: "None",
        volume: 0,
        summary: "An honest read offering grace and vulnerability while managing ongoing chronic conditions.",
        // 3D Target: Facing the Right Bookshelf wall coordinates
        cameraYRotation: -90 
    },
    {
        title: "Don't Quote Me: Smart Mouths",
        author: "J. White",
        dewey: "818.6", 
        genre: "More Books",
        seriesName: "Quote Journeys",
        volume: 1,
        summary: "A beautifully curated collection of wit, smart expressions, and interactive drawing paths.",
        // 3D Target: Facing the Deep Back Alcove shelves coordinates
        cameraYRotation: 180 
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

// Automatically rotates the room to target the physical bookshelf area
function highlightBookshelfZone(targetDegrees) {
    const cameraRig = document.querySelector('[camera]');
    if (cameraRig) {
        // Smoothly forces the 3D rendering pipeline to adjust its looking horizon vector
        cameraRig.setAttribute('rotation', { x: 0, y: targetDegrees, z: 0 });
    }
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
            <small>By ${book.author} | ${book.seriesName !== "None" ? `Vol ${book.volume} of ${book.seriesName}` : 'Standalone'}</small>
        `;
        
        // When a user selects a book card, point camera to shelf and open text card details
        item.onclick = () => {
            // Pivot the entire room orientation instantly to point at the correct wall
            highlightBookshelfZone(book.cameraYRotation);
            
            // Pop open the detailed historical library parchment card
            openParchment(`${book.title} (Class ${book.dewey})`, `
                <strong>Author:</strong> ${book.author}<br>
                <strong>Genre Hierarchy:</strong> ${book.genre}<br>
                <strong>Series Ordering:</strong> ${book.seriesName !== "None" ? `${book.seriesName} (Volume ${book.volume})` : 'N/A'}<br><br>
                <em>${book.summary}</em>
            `);
        };
        resultsContainer.appendChild(item);
    });
});
