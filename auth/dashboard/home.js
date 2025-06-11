// Authentication utilities
const AUTH_CONFIG = {
    TOKEN_KEY: 'authToken',
    FALLBACK_TOKEN_KEY: 'authtoken',
    LOGIN_URL: '../auth/login/login.html',
    PROFILE_URL: '/dashboard/profile/profile.html',
    HOME_URL: '/dashboard/home.html'
};

function getAuthToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY) || localStorage.getItem(AUTH_CONFIG.FALLBACK_TOKEN_KEY);
}

function clearAuthTokens() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.FALLBACK_TOKEN_KEY);
}

function redirectToHome() {
    window.location.href = AUTH_CONFIG.HOME_URL;
}

// IMMEDIATE AUTH CHECK - Redirects before page loads
(function () {
    const token = getAuthToken();
    if (!token) {
        redirectToHome();
        return;
    }
})();

// Toggle mobile menu functionality
function toggleMenu() {
    const menu = document.querySelector('.mobile-menu');
    menu.classList.toggle('show');
}

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeToggle = document.querySelectorAll('.theme-toggle');
    themeToggle.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fa-moon')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            btn.innerHTML = btn.innerHTML.replace('Dark', 'Light');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            btn.innerHTML = btn.innerHTML.replace('Light', 'Dark');
        }
    });
}

// Update UI for authenticated users
function updateAuthenticatedUI() {
    const loginBtns = document.querySelectorAll('.login-btn');
    const signupBtns = document.querySelectorAll('.signup-btn');
    const footerLogin = document.querySelector('.footer-login');
    const footerSignup = document.querySelector('.footer-signup');

    // Replace login buttons with profile links
    loginBtns.forEach(btn => {
        btn.textContent = 'Profile';
        const parentLink = btn.closest('a');
        if (parentLink) {
            parentLink.href = AUTH_CONFIG.PROFILE_URL;
        }
    });

    // Replace signup buttons with logout buttons
    signupBtns.forEach(btn => {
        btn.textContent = 'Logout';
        btn.classList.add('logout-btn');
        const parent = btn.closest('a');
        if (parent) {
            parent.removeAttribute('href');
            parent.addEventListener('click', handleLogout);
        }
    });

    // Update footer links
    if (footerLogin) {
        footerLogin.textContent = 'Profile';
        footerLogin.closest('a').href = AUTH_CONFIG.PROFILE_URL;
    }

    if (footerSignup) {
        footerSignup.textContent = 'Logout';
        footerSignup.classList.add('logout-btn');
        const parent = footerSignup.closest('a');
        if (parent) {
            parent.removeAttribute('href');
            parent.addEventListener('click', handleLogout);
        }
    }
}

function handleLogout(event) {
    event.preventDefault();

    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(res => {
        if (res.ok) {
            clearAuthTokens();
            alert('You have been logged out successfully');
            window.location.href = AUTH_CONFIG.LOGIN_URL;
        } else {
            throw new Error('Logout failed');
        }
    })
    .catch(err => {
        console.error('Logout error:', err);
        alert('Failed to log out. Try again.');
    });
}

// Event display and carousel functionality
function displayEvents(eventData) {
    const eventsList = document.getElementById('eventsList');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('noResults');

    loading.style.display = 'none';
    eventsList.innerHTML = '';

    if (!eventData._embedded?.events?.length) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    const events = eventData._embedded.events;
    const cardColors = ['red', 'blue', 'green', 'pink'];
    const eventsPerSlide = 4;
    const totalSlides = Math.ceil(events.length / eventsPerSlide);

    // Create carousel structure
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'event-carousel';

    const carouselInner = document.createElement('div');
    carouselInner.className = 'carousel-inner';

    // Create slides
    for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'carousel-slide';
        slideDiv.style.display = slideIndex === 0 ? 'flex' : 'none';

        for (let i = 0; i < eventsPerSlide; i++) {
            const eventIndex = slideIndex * eventsPerSlide + i;
            if (eventIndex >= events.length) break;

            const event = events[eventIndex];
            const eventCard = createEventCard(event, eventIndex, cardColors);
            slideDiv.appendChild(eventCard);
        }

        carouselInner.appendChild(slideDiv);
    }

    // Create navigation
    const navigation = createCarouselNavigation(totalSlides);

    carouselContainer.appendChild(carouselInner);
    carouselContainer.appendChild(navigation);
    eventsList.appendChild(carouselContainer);

    setupBookmarkButtons();
}

function createEventCard(event, index, cardColors) {
    const venue = event._embedded?.venues?.[0] ?
        `${event._embedded.venues[0].city.name}, ${event._embedded.venues[0].country.name}` :
        'Location not specified';

    const eventDate = event.dates?.start?.localDate ?
        new Date(event.dates.start.localDate).toLocaleDateString('en-AU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) : 'Date TBA';

    const imageUrl = event.images?.[0]?.url || '/public/homepage/assets/images/event.png';

    const cardElement = document.createElement('div');
    cardElement.className = `event-card ${cardColors[index % cardColors.length]}`;

    cardElement.innerHTML = `
        <img src="${imageUrl}" alt="${event.name}" class="event-image">
        <div class="card-content">
            <p class="location">
                <i class="fas fa-map-marker-alt"></i> ${venue}
            </p>
            <h3 class="event-title">${event.name}</h3>
            <p class="date">
                <i class="fas fa-calendar-alt"></i> ${eventDate}
                <span class="platform">Ticketmaster</span>
            </p>
            <div class="card-buttons">
                <button class="bookmark">
                    <i class="fas fa-bookmark"></i> BookMark
                </button>
                <button class="start" onclick="window.open('${event.url}', '_blank')">
                    Get Tickets <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;

    return cardElement;
}

function createCarouselNavigation(totalSlides) {
    const navigation = document.createElement('div');
    navigation.className = 'carousel-navigation';

    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-nav-btn prev-btn';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.onclick = () => navigateCarousel('prev', totalSlides);

    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-nav-btn next-btn';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.onclick = () => navigateCarousel('next', totalSlides);

    navigation.appendChild(prevButton);
    navigation.appendChild(nextButton);

    return navigation;
}

function navigateCarousel(direction, totalSlides) {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlideIndex = 0;

    slides.forEach((slide, index) => {
        if (slide.style.display === 'flex') {
            currentSlideIndex = index;
            slide.style.display = 'none';
        }
    });

    const newSlideIndex = direction === 'next' ?
        (currentSlideIndex + 1) % totalSlides :
        (currentSlideIndex - 1 + totalSlides) % totalSlides;

    slides[newSlideIndex].style.display = 'flex';
}

// Tag Modal Functionality
function showTagModal(eventData, btn) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'tag-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'tag-modal-content';
    modalContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    // Available tags
    const availableTags = ['Music', 'Dance', 'Sports', 'Comedy', 'Theater', 'Festival'];

    modalContent.innerHTML = `
        <h3 style="margin-bottom: 15px; color: #333;">Add Tags to Event</h3>
        <p style="margin-bottom: 20px; color: #666;">Select up to 6 tags for this event (optional):</p>
        <div class="tag-options" style="margin-bottom: 20px;">
            ${availableTags.map(tag => `
                <button class="tag-option" data-tag="${tag}" style="
                    margin: 5px;
                    padding: 8px 15px;
                    border: 2px solid #ddd;
                    background: white;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.borderColor='#007bff'" onmouseout="this.style.borderColor=this.classList.contains('selected') ? '#007bff' : '#ddd'">${tag}</button>
            `).join('')}
        </div>
        <div class="modal-buttons">
            <button class="cancel-btn" style="
                margin-right: 10px;
                padding: 10px 20px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 5px;
                cursor: pointer;
            ">Skip</button>
            <button class="save-btn" style="
                padding: 10px 20px;
                border: none;
                background: #007bff;
                color: white;
                border-radius: 5px;
                cursor: pointer;
            ">Save Bookmark</button>
        </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Handle tag selection
    const tagOptions = modalContent.querySelectorAll('.tag-option');
    const selectedTags = new Set();

    tagOptions.forEach(option => {
        option.addEventListener('click', function () {
            const tag = this.dataset.tag;

            if (this.classList.contains('selected')) {
                // Deselect tag
                this.classList.remove('selected');
                this.style.backgroundColor = 'white';
                this.style.borderColor = '#ddd';
                this.style.color = '#333';
                selectedTags.delete(tag);
            } else if (selectedTags.size < 6) {
                // Select tag (max 6)
                this.classList.add('selected');
                this.style.backgroundColor = '#007bff';
                this.style.borderColor = '#007bff';
                this.style.color = 'white';
                selectedTags.add(tag);
            } else {
                alert('You can select a maximum of 6 tags.');
            }
        });
    });

    // Handle buttons
    modalContent.querySelector('.cancel-btn').addEventListener('click', function () {
        // Save without tags
        saveBookmarkWithTags(eventData, [], btn);
        document.body.removeChild(modalOverlay);
    });

    modalContent.querySelector('.save-btn').addEventListener('click', function () {
        // Save with selected tags
        saveBookmarkWithTags(eventData, Array.from(selectedTags), btn);
        document.body.removeChild(modalOverlay);
    });

    // Close modal when clicking outside
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            saveBookmarkWithTags(eventData, [], btn);
            document.body.removeChild(modalOverlay);
        }
    });
}

function saveBookmarkWithTags(eventData, tags, btn) {
    const token = getAuthToken();

    // Add tags to event data
    const bookmarkData = {
        ...eventData,
        tags: tags.join(',') // Convert array to comma-separated string
    };

    fetch('/api/events/bookmark', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookmarkData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tagsText = tags.length > 0 ? ` with tags: ${tags.join(', ')}` : '';
                alert(`Event bookmarked successfully${tagsText}!`);
                btn.innerHTML = '<i class="fas fa-bookmark" style="color: #gold;"></i> Bookmarked';
                btn.disabled = true;
            } else {
                alert('Failed to bookmark event');
            }
        })
        .catch(error => {
            console.error('Bookmark error:', error);
            alert('Failed to bookmark event');
        });
}

// Main bookmark handler - now with tag modal integration
function handleBookmark(btn) {
    const eventCard = btn.closest('.event-card');
    const eventData = {
        name: eventCard.querySelector('.event-title').textContent,
        location: eventCard.querySelector('.location').textContent.replace(/.*\s/, ''),
        date: eventCard.querySelector('.date').textContent.replace(/.*\s/, '').replace('Ticketmaster', '').trim(),
        image: eventCard.querySelector('.event-image').src,
        ticketUrl: eventCard.querySelector('.start').getAttribute('onclick').match(/'([^']+)'/)[1],
        platform: 'Ticketmaster'
    };

    // Show tag selection modal
    showTagModal(eventData, btn);
}

// Setup bookmark buttons
function setupBookmarkButtons() {
    const bookmarkButtons = document.querySelectorAll('.bookmark');

    bookmarkButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            handleBookmark(btn);
        });
    });
}

// API utilities
function formatDateForAPI(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function makeAuthenticatedRequest(url, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers
    }).then(response => {
        if (response.status === 401) {
            clearAuthTokens();
            redirectToLogin();
            throw new Error('Session expired');
        }
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    });
}

// Event fetching functions
function fetchEvents(searchParams) {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    const queryParams = new URLSearchParams();

    if (searchParams.location) queryParams.append('location', searchParams.location);
    if (searchParams.keyword) queryParams.append('keyword', searchParams.keyword);
    if (searchParams.startDate) {
        queryParams.append('startDateTime', `${formatDateForAPI(searchParams.startDate)}T00:00:00Z`);
    }
    if (searchParams.endDate) {
        queryParams.append('endDateTime', `${formatDateForAPI(searchParams.endDate)}T23:59:59Z`);
    }
    if (searchParams.sort) queryParams.append('sort', searchParams.sort);

    queryParams.append('countryCode', 'AU');

    const apiUrl = `/search-events?${queryParams.toString()}`;

    makeAuthenticatedRequest(apiUrl)
        .then(data => {
            displayEvents(data);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            displayEvents(getMockEventData());
        });
}

function fetchTrendingEvents() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const queryParams = new URLSearchParams();
    queryParams.append('startDateTime', `${formatDateForAPI(today)}T00:00:00Z`);
    queryParams.append('endDateTime', `${formatDateForAPI(nextWeek)}T23:59:59Z`);
    queryParams.append('sort', 'date,asc');
    queryParams.append('countryCode', 'AU');

    const apiUrl = `/search-events?${queryParams.toString()}`;

    makeAuthenticatedRequest(apiUrl)
        .then(data => {
            displayEvents(data);
        })
        .catch(error => {
            console.error('Error fetching trending events:', error);
            displayEvents(getMockEventData());
        });
}

// Form handling
function handleSearchFormSubmit(event) {
    event.preventDefault();

    const formData = {
        location: document.getElementById('location').value,
        keyword: document.getElementById('keyword').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        sort: document.getElementById('sort').value
    };

    const resultsHeading = document.querySelector('.results-heading');
    resultsHeading.textContent = `${formData.keyword || 'All'} Events in ${formData.location || 'All of Australia'}`;

    fetchEvents(formData);
}

// Mock data for fallback
function getMockEventData() {
    return {
        "_embedded": {
            "events": [
                {
                    "name": "Ed Sheeran: Mathematics Tour",
                    "url": "https://www.ticketmaster.com.au/ed-sheeran-mathematics-tour-sydney-05-14-2025/event/13005E8D8B681234",
                    "images": [{ "url": "/auth/homepage/assets/images/event.png" }],
                    "dates": { "start": { "localDate": "2025-05-15" } },
                    "_embedded": {
                        "venues": [{
                            "city": { "name": "Sydney" },
                            "country": { "name": "Australia" }
                        }]
                    }
                },
                {
                    "name": "Taylor Swift: The Eras Tour",
                    "url": "https://www.ticketmaster.com.au/taylor-swift-the-eras-tour-sydney-05-16-2025/event/13005E81F9A25678",
                    "images": [{ "url": "/auth/homepage/assets/images/event.png" }],
                    "dates": { "start": { "localDate": "2025-05-16" } },
                    "_embedded": {
                        "venues": [{
                            "city": { "name": "Sydney" },
                            "country": { "name": "Australia" }
                        }]
                    }
                },
                {
                    "name": "Coldplay: Music of the Spheres",
                    "url": "https://www.ticketmaster.com.au/coldplay-music-of-the-spheres-sydney-05-17-2025/event/13005E91CA9D9012",
                    "images": [{ "url": "/auth/homepage/assets/images/event.png" }],
                    "dates": { "start": { "localDate": "2025-05-17" } },
                    "_embedded": {
                        "venues": [{
                            "city": { "name": "Sydney" },
                            "country": { "name": "Australia" }
                        }]
                    }
                },
                {
                    "name": "Bad Bunny: Most Wanted Tour",
                    "url": "https://www.ticketmaster.com.au/bad-bunny-most-wanted-tour-sydney-05-18-2025/event/13005E7AD45B3456",
                    "images": [{ "url": "/auth/homepage/assets/images/event.png" }],
                    "dates": { "start": { "localDate": "2025-05-18" } },
                    "_embedded": {
                        "venues": [{
                            "city": { "name": "Sydney" },
                            "country": { "name": "Australia" }
                        }]
                    }
                },
                {
                    "name": "Adele: Weekend With Adele",
                    "url": "https://www.ticketmaster.com.au/adele-weekend-with-adele-sydney-05-19-2025/event/13005E84BA7D7890",
                    "images": [{ "url": "/auth/homepage/assets/images/event.png" }],
                    "dates": { "start": { "localDate": "2025-05-19" } },
                    "_embedded": {
                        "venues": [{
                            "city": { "name": "Sydney" },
                            "country": { "name": "Australia" }
                        }]
                    }
                }
            ]
        }
    };
}

function displayNoResults() {
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('noResults');
    loading.style.display = 'none';
    noResults.style.display = 'block';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    // Remove font-awesome integrity check
    const fontAwesomeLink = document.querySelector('link[href*="font-awesome"]');
    if (fontAwesomeLink) {
        fontAwesomeLink.removeAttribute('integrity');
        fontAwesomeLink.removeAttribute('crossorigin');
    }

    // Update UI for authenticated users
    updateAuthenticatedUI();

    // Setup theme toggle
    document.querySelectorAll('.theme-toggle').forEach(button => {
        button.addEventListener('click', toggleTheme);
    });

    // Setup search form
    const searchForm = document.getElementById('eventSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchFormSubmit);
    }

    // Set default dates
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (startDateInput && !startDateInput.value) {
        startDateInput.value = today.toISOString().split('T')[0];
    }

    if (endDateInput && !endDateInput.value) {
        endDateInput.value = nextWeek.toISOString().split('T')[0];
    }

    // Load trending events
    fetchTrendingEvents();
});
