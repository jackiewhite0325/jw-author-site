/* ============================================================================
1. UI Setup & Dynamic Shelf Builder Matrix
============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const shelvesContainer = document.getElementById('shelves-container');
  if (!shelvesContainer) return;

  // Build the bookshelf spines dynamically
  libraryMasterCatalog.forEach(book => {
    const btn = document.createElement('button');
    btn.className = 'spine-plate-btn';
    btn.id = `spine-btn-${book.id}`;
    btn.style.borderLeft = `6px solid ${book.spineColor}`;
    btn.setAttribute('aria-label', `Pull book titled ${book.title}`);
    
    // Title Label Element
    const titleText = document.createElement('span');
    titleText.textContent = book.title;
    
    // Dewey Accent Tag
    const deweyText = document.createElement('span');
    deweyText.className = 'spine-dewey-label';
    deweyText.textContent = book.dewey;
    
    btn.appendChild(titleText);
    btn.appendChild(deweyText);
    
    // Route click interaction engine safely
    btn.addEventListener('click', () => {
      selectBook(book.id);
    });
    
    shelvesContainer.appendChild(btn);
  });
});

/* ============================================================================
2. Router Routing Logic
============================================================================ */
function selectBook(bookId) {
  if (isAnimationSequenceRunning) return;

  const bookData = libraryMasterCatalog.find(b => b.id === bookId);
  if (!bookData) return;

  // If selecting the active book, close it down
  if (activeBookInstance && activeBookInstance.id === bookId) {
    closeActiveBook();
    return;
  }

  // Toggle active button markers on shelf visual components
  document.querySelectorAll('.spine-plate-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const targetedSpine = document.getElementById(`spine-btn-${bookId}`);
  if (targetedSpine) targetedSpine.classList.add('active');

  if (activeBookInstance) {
    closeActiveBook(() => executeBookOpenSequence(bookData));
  } else {
    executeBookOpenSequence(bookData);
  }
}

/* ============================================================================
3. Animation Lifecycle Routines & Renderer Hooks
============================================================================ */
function executeBookOpenSequence(bookData) {
  isAnimationSequenceRunning = true;
  activeBookInstance = bookData;

  triggerToastNotification(`Pulling "${bookData.title}" off the library shelf...`);

  // Simulate smooth paper flip delay execution sequence
  setTimeout(() => {
    const promptView = document.getElementById('empty-desk-prompt');
    const ledgerCard = document.getElementById('interactive-ledger');
    const titleNode = document.getElementById('ledger-title');
    const deweyNode = document.getElementById('ledger-dewey');
    const listNode = document.getElementById('ledger-toc-list');
    const accentNode = document.getElementById('ledger-accent-bar');

    if (promptView && ledgerCard && titleNode && deweyNode && listNode && accentNode) {
      promptView.classList.add('hidden');
      
      // Update DOM markup values
      titleNode.textContent = bookData.title;
      deweyNode.textContent = `DEWEY CATALOG REGISTRY: ${bookData.dewey}`;
      accentNode.style.backgroundColor = bookData.spineColor;
      
      // Map out dynamic table of contents lists cleanly
      listNode.innerHTML = '';
      bookData.toc.forEach(chapter => {
        const li = document.createElement('li');
        li.textContent = chapter;
        listNode.appendChild(li);
      });
      
      ledgerCard.classList.remove('hidden');
    }
    
    isAnimationSequenceRunning = false;
  }, 400);
}

function closeActiveBook(callback = null) {
  isAnimationSequenceRunning = true;
  
  // Wipe visual active highlights on the bookshelves
  document.querySelectorAll('.spine-plate-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const promptView = document.getElementById('empty-desk-prompt');
  const ledgerCard = document.getElementById('interactive-ledger');

  if (promptView && ledgerCard) {
    ledgerCard.classList.add('hidden');
    promptView.classList.remove('hidden');
  }

  setTimeout(() => {
    activeBookInstance = null;
    isAnimationSequenceRunning = false;
    if (callback && typeof callback === 'function') {
      callback();
    }
  }, 200);
}

/* ============================================================================
4. Global UI Component Helpers
============================================================================ */
function triggerToastNotification(message) {
  const toast = document.getElementById('library-status-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 2200);
}
