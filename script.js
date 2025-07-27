// ========================
// UTILITY FUNCTIONS
// ========================
function debounce(func, wait = 20) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function throttle(func, limit = 100) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }
}

// ========================
// CRITICAL FUNCTIONS (Load immediately)
// ========================
function initCritical() {
  // Preloader
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.style.display = 'none', 500);
    }, 1500);
  }

  // Mobile Navigation
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li');
    
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('toggle');
    });
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('toggle');
      });
    });
  }

  // Lazy load polyfill if needed
  if (!('loading' in HTMLImageElement.prototype)) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.6.1/dist/lazyload.min.js';
    script.onload = () => new LazyLoad({ elements_selector: '.lazy' });
    document.body.appendChild(script);
  }
}

// ========================
// NON-CRITICAL FUNCTIONS (Deferred)
// ========================
function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  
  window.addEventListener('scroll', debounce(() => {
    header.classList.toggle('scrolled', window.scrollY > 100);
  }));
}

function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  
  window.addEventListener('scroll', debounce(() => {
    btn.classList.toggle('active', window.scrollY > 300);
  }));
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initAnimations() {
  const animateOnScroll = debounce(() => {
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add('animated');
      }
    });
  });
  
  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll();

  // Feature cards animation
  document.querySelectorAll('.feature-card').forEach((card, index) => {
    setTimeout(() => card.classList.add('animate'), index * 200);
  });
}

function initBookSearch() {
  const searchInput = document.querySelector('.search-bar input');
  const searchButton = document.querySelector('.search-bar button');
  const catalogGrid = document.querySelector('.catalog-grid');
  
  if (!searchInput || !catalogGrid) return;

  function performSearch() {
    const term = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.book-card');
    let hasResults = false;

    // Remove existing no-results message
    catalogGrid.querySelector('.no-results-message')?.remove();

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = term && !text.includes(term) ? 'none' : 'block';
      if (card.style.display === 'block') hasResults = true;
    });

    if (!hasResults && term) {
      const message = document.createElement('p');
      message.className = 'no-results-message';
      message.textContent = 'No books found matching your search. Try different keywords.';
      message.style.cssText = 'text-align:center; grid-column:1/-1; padding:2rem; color:var(--dark-brown)';
      catalogGrid.style.minHeight = '200px';
      catalogGrid.appendChild(message);
    } else {
      catalogGrid.style.minHeight = '';
    }
  }

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && performSearch());
  if (searchInput.value) performSearch();
}

function initContactForm() {
  const form = document.querySelector('.contact-form form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      name: form.querySelector('input[name="name"]').value,
      email: form.querySelector('input[name="email"]').value,
      message: form.querySelector('textarea[name="message"]').value
    };
    console.log(formData); // Replace with actual submission
    alert('Thank you for your message! We will get back to you soon.');
    form.reset();
  });
}

function init3DBooks() {
  document.querySelectorAll('.book-3d').forEach(book => {
    book.addEventListener('mousemove', throttle((e) => {
      const rect = book.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = rect.height / 2 - (e.clientY - rect.top);
      book.style.transform = `perspective(2000px) rotateY(${x/20}deg) rotateX(${y/20}deg)`;
    }));
    
    book.addEventListener('mouseleave', () => {
      book.style.transition = 'transform 0.5s ease';
      book.style.transform = 'perspective(2000px) rotateY(0) rotateX(0)';
      setTimeout(() => book.style.transition = '', 500);
    });
  });
}

function initEventCountdowns() {
  document.querySelectorAll('.event-date').forEach(eventDate => {
    const eventDateObj = new Date(eventDate.textContent);
    const today = new Date();
    const diffDays = Math.ceil((eventDateObj - today) / (1000 * 60 * 60 * 24));
    
    eventDate.innerHTML += `<span class="countdown"> (${
      eventDateObj > today ? `in ${diffDays} days` : 'Past Event'
    })</span>`;
  });
}

function initGallery() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const modal = document.createElement('div');
      modal.className = 'image-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <img src="${item.querySelector('img').src}" alt="Library Image">
        </div>
      `;
      
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';
      
      modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = 'auto';
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
          document.body.style.overflow = 'auto';
        }
      });
    });
  });
}

function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isOpen = question.classList.toggle('active');
      
      // Close others
      document.querySelectorAll('.faq-question').forEach(q => {
        if (q !== question) {
          q.classList.remove('active');
          q.nextElementSibling.style.maxHeight = null;
        }
      });
      
      answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : null;
      
      // Handle URL hash
      if (isOpen && window.location.hash !== `#${question.id}`) {
        history.pushState(null, null, `#${question.id}`);
      }
    });
  });

  // Open FAQ from URL hash
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target?.classList.contains('faq-question')) {
      setTimeout(() => {
        target.click();
        target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
}

function generateBookCards() {
  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4,
      description: "A portrait of the Jazz Age in all of its decadence and excess, Gatsby captured the spirit of the author's generation and earned itself a permanent place in American mythology.",
      category: "Classic"
    },
    // ... (include all your other books here)
  ];

  const grid = document.querySelector('.catalog-grid');
  if (!grid) return;

  grid.innerHTML = books.map(book => `
    <div class="book-card animate-on-scroll">
      <div class="book-cover">
        <img loading="lazy" src="${book.cover}" alt="${book.title}">
      </div>
      <div class="book-content">
        <h3>${book.title}</h3>
        <p class="book-author">${book.author}</p>
        <div class="book-badge">${book.category}</div>
        <p class="book-desc">${book.description}</p>
      </div>
    </div>
  `).join('');

  initBookSearch();
}

function fetchRandomFeaturedBook() {
  const books = [
    {
      title: "The Silent Patient",
      author: "Alex Michaelides",
      cover: "https://i.pinimg.com/736x/ee/c3/7c/eec37c45c2b005f960546946d242308a.jpg",
      description: "Alicia Berenson's life is seemingly perfect...",
      opening: "Alicia Berenson was thirty-three years old...",
      rating: "★★★★☆",
      genre: "Psychological Thriller"
    },
    // ... (other featured books)
  ];

  const book = books[Math.floor(Math.random() * books.length)];
  const select = selector => document.querySelector(selector);
  
  select('.book-cover-img').src = book.cover;
  select('.book-cover-img').alt = `${book.title} Cover`;
  select('.book-details h3').textContent = book.title;
  select('.book-details .author').textContent = `by ${book.author}`;
  select('.book-details .description').textContent = book.description;
  select('.first-page h3').textContent = book.title;
  select('.first-page p:first-of-type').textContent = `by ${book.author}`;
  select('.opening-line').textContent = book.opening;
  select('.rating').textContent = book.rating;
  select('.genre').textContent = book.genre;
}

// ========================
// INITIALIZATION
// ========================
function initNonCritical() {
  initStickyHeader();
  initBackToTop();
  initAnimations();
  initBookSearch();
  initContactForm();
  init3DBooks();
  initEventCountdowns();
  initGallery();
  initFAQ();
  generateBookCards();
  fetchRandomFeaturedBook();
}

// Start critical functions immediately
initCritical();

// Load non-critical functions when ready
if (document.readyState === 'complete') {
  requestIdleCallback ? requestIdleCallback(initNonCritical) : initNonCritical();
} else {
  window.addEventListener('load', () => {
    requestIdleCallback ? requestIdleCallback(initNonCritical) : initNonCritical();
  });
}


// Book recommendation function
window.getBook = function(mood) {
  const recommendations = {
    inspirational: "💡 Try 'The Alchemist' by Paulo Coelho - a beautiful journey about following your dreams.",
    mystery: "🕵️‍♀️ Try 'Gone Girl' by Gillian Flynn - a thrilling psychological mystery that will keep you guessing.",
    romance: "💕 Try 'The Fault in Our Stars' by John Green - a heartwarming and heartbreaking love story.",
    "self-help": "🌱 Try 'Atomic Habits' by James Clear - learn how tiny changes can yield remarkable results."
  };
  
  const resultElement = document.getElementById("quiz-result");
  resultElement.textContent = recommendations[mood];
  resultElement.style.animation = 'none';
  setTimeout(() => {
    resultElement.style.animation = 'fadeIn 0.6s ease forwards';
  }, 10);
};

// Fun facts functionality
const facts = [
  "The oldest library in the world is the Al-Qarawiyyin Library in Morocco, established in 859 AD!",
  "The word 'library' comes from the Latin 'liber,' meaning book or bark (of a tree).",
  "The largest library in the world is the Library of Congress with over 170 million items.",
  "Some libraries lend out more than books - you can borrow tools, games, and even musical instruments!",
  "The most expensive book ever sold was Leonardo da Vinci's 'Codex Leicester', purchased by Bill Gates for $30.8 million."
];

window.showFact = function() {
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  const factElement = document.getElementById("factResult");
  factElement.textContent = randomFact;
  factElement.style.animation = 'none';
  setTimeout(() => {
    factElement.style.animation = 'fadeIn 0.6s ease forwards';
  }, 10);
};


// Update your countdown function with this
document.addEventListener("DOMContentLoaded", function() {
  // Initialize countdowns
  initializeCountdown("1", "july 20, 2025 18:00:00");
  initializeCountdown("2", "july 22, 2025 10:00:00");
  // Add more as needed
  
  // Search functionality
  const searchInput = document.getElementById('search');
  if (searchInput) {
    const eventCards = document.querySelectorAll('.event-card-custom');
    
    searchInput.addEventListener('input', function() {
      const query = searchInput.value.toLowerCase();
      eventCards.forEach(card => {
        const eventTitle = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = eventTitle.includes(query) ? "flex" : "none";
      });
    });
  }
});

function initializeCountdown(id, targetDateStr) {
  const targetDate = new Date(targetDateStr).getTime();
  
  // Update countdown immediately and then every second
  updateCountdown(id, targetDate);
  setInterval(() => updateCountdown(id, targetDate), 1000);
}

function updateCountdown(id, targetDate) {
  const now = new Date().getTime();
  const diff = targetDate - now;
  
  // If countdown is over
  if (diff <= 0) {
    document.getElementById(`countdown-${id}`).innerHTML = '<div class="event-started">Event Started!</div>';
    return;
  }
  
  // Calculate time units
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  // Update display
  document.getElementById(`days-${id}`).textContent = formatTime(days);
  document.getElementById(`hours-${id}`).textContent = formatTime(hours);
  document.getElementById(`minutes-${id}`).textContent = formatTime(minutes);
  document.getElementById(`seconds-${id}`).textContent = formatTime(seconds);
}

function formatTime(time) {
  return time < 10 ? `0${time}` : time;
}


// Profile picture upload functionality
document.addEventListener('DOMContentLoaded', function() {
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const avatarUpload = document.getElementById('avatarUpload');
  const avatarPreview = document.getElementById('avatarPreview');
  
  // Default avatar with initials
  const defaultAvatar = 'https://ui-avatars.com/api/?name=GT&background=8B4513&color=fff';
  
  // Check if there's a saved avatar in localStorage
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) {
    document.getElementById('userAvatar').src = savedAvatar;
  }
  
  changeAvatarBtn.addEventListener('click', function() {
    avatarUpload.click();
  });
  
  avatarUpload.addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      
      reader.onload = function(event) {
        const img = document.getElementById('userAvatar');
        img.src = event.target.result;
        
        // Save to localStorage
        localStorage.setItem('userAvatar', event.target.result);
      }
      
      reader.readAsDataURL(e.target.files[0]);
    }
  });
  
  // Profile edit functionality
  const editProfileBtn = document.getElementById('editProfileBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const profileActions = document.getElementById('profileActions');
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const nameInput = document.getElementById('nameInput');
  const emailInput = document.getElementById('emailInput');
  
  editProfileBtn.addEventListener('click', function() {
    // Show input fields with current values
    nameInput.value = userName.textContent;
    emailInput.value = userEmail.textContent;
    
    // Hide static text, show inputs
    userName.style.display = 'none';
    userEmail.style.display = 'none';
    nameInput.style.display = 'block';
    emailInput.style.display = 'block';
    
    // Show action buttons
    profileActions.style.display = 'flex';
    
    // Hide edit button
    editProfileBtn.style.display = 'none';
  });
  
  saveProfileBtn.addEventListener('click', function() {
    // Update the displayed values
    userName.textContent = nameInput.value;
    userEmail.textContent = emailInput.value;
    
    // Hide inputs, show static text
    nameInput.style.display = 'none';
    emailInput.style.display = 'none';
    userName.style.display = 'block';
    userEmail.style.display = 'block';
    
    // Hide action buttons
    profileActions.style.display = 'none';
    
    // Show edit button
    editProfileBtn.style.display = 'block';
    
    // Here you would typically save to a database
  });
  
  cancelEditBtn.addEventListener('click', function() {
    // Hide inputs, show static text
    nameInput.style.display = 'none';
    emailInput.style.display = 'none';
    userName.style.display = 'block';
    userEmail.style.display = 'block';
    
    // Hide action buttons
    profileActions.style.display = 'none';
    
    // Show edit button
    editProfileBtn.style.display = 'block';
  });
});
