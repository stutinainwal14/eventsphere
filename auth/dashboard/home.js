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

// Checks authentication status and update UI accordingly
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;

    const loginBtns = document.querySelectorAll('.login-btn');
    const signupBtns = document.querySelectorAll('.signup-btn');
    const footerLogin = document.querySelector('.footer-login');
    const footerSignup = document.querySelector('.footer-signup');

    if (isLoggedIn) {
        // If logged in, replace login/signup buttons with profile/logout
        loginBtns.forEach(btn => {
            btn.textContent = 'Profile';
            btn.closest('a').href = '../dashboard/profile.html';
        });

        signupBtns.forEach(btn => {
            btn.textContent = 'Logout';
            btn.classList.add('logout-btn');
            const parent = btn.closest('a');
            if (parent) {
                parent.removeAttribute('href');
                parent.addEventListener('click', handleLogout);
            }
        });

        if (footerLogin) {
            footerLogin.textContent = 'Profile';
            footerLogin.closest('a').href = '../dashboard/profile.html';
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
}

// Handle logout functionality
function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('token');
    alert('You have been logged out successfully');
    window.location.href = '../auth/login/login.html';
}

// Displays event cards in search results
function displayEvents(eventData) {
    const eventsList = document.getElementById('eventsList');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('noResults');

    loading.style.display = 'none';

    // Clear existing content
    eventsList.innerHTML = '';

    if (!eventData._embedded || !eventData._embedded.events || eventData._embedded.events.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    const events = eventData._embedded.events;
    const cardColors = ['red', 'blue', 'green', 'pink'];

    // Creates carousel container
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'event-carousel';

    // Creates carousel inner container for the slides
    const carouselInner = document.createElement('div');
    carouselInner.className = 'carousel-inner';

    const totalEvents = events.length;
    const eventsPerSlide = 4;
    const totalSlides = Math.ceil(totalEvents / eventsPerSlide);

    // Create slide pages
    for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'carousel-slide';
        slideDiv.id = `slide-${slideIndex}`;
        slideDiv.style.display = slideIndex === 0 ? 'flex' : 'none';

        for (let i = 0; i < eventsPerSlide; i++) {
            const eventIndex = slideIndex * eventsPerSlide + i;
            if (eventIndex >= totalEvents) break;

            const event = events[eventIndex];

            const venue = event._embedded && event._embedded.venues && event._embedded.venues[0] ?
                `${event._embedded.venues[0].city.name}, ${event._embedded.venues[0].country.name}` :
                'Location not specified';

            const eventDate = event.dates && event.dates.start ?
                new Date(event.dates.start.localDate).toLocaleDateString('en-AU', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }) :
                'Date TBA';

            const cardElement = document.createElement('div');
            cardElement.className = `event-card ${cardColors[eventIndex % cardColors.length]}`;

            const imageUrl = event.images && event.images.length > 0 ?
                event.images[0].url :
                '/public/homepage/assets/images/event.png';

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

            slideDiv.appendChild(cardElement);
        }

        carouselInner.appendChild(slideDiv);
    }

    // Creates carousel navigation
    const carouselNavigation = document.createElement('div');
    carouselNavigation.className = 'carousel-navigation';

    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-nav-btn prev-btn';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.onclick = () => navigateCarousel('prev', totalSlides);

    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-nav-btn next-btn';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.onclick = () => navigateCarousel('next', totalSlides);

    carouselNavigation.appendChild(prevButton);
    carouselNavigation.appendChild(nextButton);

    carouselContainer.appendChild(carouselInner);
    carouselContainer.appendChild(carouselNavigation);

    eventsList.appendChild(carouselContainer);

    setupBookmarkButtons();
}

// Function to navigate the carousel
function navigateCarousel(direction, totalSlides) {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlideIndex = 0;

    slides.forEach((slide, index) => {
        if (slide.style.display === 'flex') {
            currentSlideIndex = index;
            slide.style.display = 'none';
        }
    });

    let newSlideIndex;
    if (direction === 'next') {
        newSlideIndex = (currentSlideIndex + 1) % totalSlides;
    } else {
        newSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    }

    slides[newSlideIndex].style.display = 'flex';
}

// Setup bookmark buttons - checks if user is logged in before allowing bookmarks
function setupBookmarkButtons() {
    const token = localStorage.getItem('token');
    const bookmarkButtons = document.querySelectorAll('.bookmark');

    bookmarkButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (!token) {
                alert('Please login to bookmark events');
                window.location.href = '../auth/login/login.html';
            } else {
                alert('Event added to bookmarks!');
            }
        });
    });
}

// Formats date in ISO format with timezone for API request
function formatDateForAPI(dateString) {
    if (!dateString) return '';

    // Creating Date object from the input
    const date = new Date(dateString);

    // Format to YYYY-MM-DDThh:mm:ssZ format
    // For startDateTime, set time to 00:00:00
    // For endDateTime, set time to 23:59:59
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Function to fetch events from the API with authentication
function fetchEvents(searchParams) {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    const queryParams = new URLSearchParams();

    if (searchParams.location) queryParams.append('location', searchParams.location);
    if (searchParams.keyword) queryParams.append('keyword', searchParams.keyword);

    // Formats the dates correctly for API
    if (searchParams.startDate) {
        const formattedStartDate = formatDateForAPI(searchParams.startDate);
        queryParams.append('startDateTime', `${formattedStartDate}T00:00:00Z`);
    }

    if (searchParams.endDate) {
        const formattedEndDate = formatDateForAPI(searchParams.endDate);
        queryParams.append('endDateTime', `${formattedEndDate}T23:59:59Z`);
    }

    if (searchParams.sort) queryParams.append('sort', searchParams.sort);

    queryParams.append('countryCode', 'AU');

    const endpoint = '/search-events';
    const apiUrl = `${endpoint}?${queryParams.toString()}`;

    console.log('Fetching events from API:', apiUrl);

    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(apiUrl, {
        method: 'GET',
        headers: headers
    })
        .then(response => {
            console.log('API Response status:', response.status);
            if (response.status === 401) {
                alert('Your session has expired. Please login again.');
                window.location.href = '../auth/login/login.html';
                throw new Error('Unauthorized');
            }
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('API returned data:', data);
            displayEvents(data);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            console.error('Error details:', error.toString());
            displayNoResults();
            console.log('Falling back to mock data');
            displayEvents(getMockEventData());
        });
}

// Form submission handler
function handleSearchFormSubmit(event) {
    event.preventDefault();

    const location = document.getElementById('location').value;
    const keyword = document.getElementById('keyword').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const sort = document.getElementById('sort').value;

    const resultsHeading = document.querySelector('.results-heading');
    resultsHeading.textContent = `${keyword || 'All'} Events in ${location || 'All of Australia'}`;

    console.log('Search parameters:', {
        location: location,
        keyword: keyword,
        startDate: startDate,
        endDate: endDate,
        sort: sort
    });

    fetchEvents({
        location: location,
        keyword: keyword,
        startDate: startDate,
        endDate: endDate,
        sort: sort
    });
}

// Function to get trending events with authentication
function fetchTrendingEvents() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    const queryParams = new URLSearchParams();

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const formattedToday = formatDateForAPI(today);
    const formattedNextWeek = formatDateForAPI(nextWeek);

    queryParams.append('startDateTime', `${formattedToday}T00:00:00Z`);
    queryParams.append('endDateTime', `${formattedNextWeek}T23:59:59Z`);
    queryParams.append('sort', 'date,asc');
    queryParams.append('countryCode', 'AU');

    const apiUrl = `/search-events?${queryParams.toString()}`;
    console.log('Fetching trending events from API:', apiUrl);

    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(apiUrl, {
        method: 'GET',
        headers: headers
    })
        .then(response => {
            console.log('Trending API Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Trending API returned data:', data);
            displayEvents(data);
        })
        .catch(error => {
            console.error('Error fetching trending events:', error);
            console.error('Error details:', error.toString());

            console.log('Falling back to mock data for trending events');
            displayEvents(getMockEventData());
        });
}

// Mock event data for fallback purposes
function getMockEventData() {
    return {
        "_embedded": {
            "events": [
                {
                    "name": "Ed Sheeran: Mathematics Tour",
                    "url": "https://www.ticketmaster.com.au/ed-sheeran-mathematics-tour-sydney-05-14-2025/event/13005E8D8B681234",
                    "images": [
                        {
                            "url": "/auth/homepage/assets/images/event.png"
                        }
                    ],
                    "dates": {
                        "start": {
                            "localDate": "2025-05-15"
                        }
                    },
                    "_embedded": {
                        "venues": [
                            {
                                "city": {
                                    "name": "Sydney"
                                },
                                "country": {
                                    "name": "Australia"
                                }
                            }
                        ]
                    }
                },
                {
                    "name": "Taylor Swift: The Eras Tour",
                    "url": "https://www.ticketmaster.com.au/taylor-swift-the-eras-tour-sydney-05-16-2025/event/13005E81F9A25678",
                    "images": [
                        {
                            "url": "/auth/homepage/assets/images/event.png"
                        }
                    ],
                    "dates": {
                        "start": {
                            "localDate": "2025-05-16"
                        }
                    },
                    "_embedded": {
                        "venues": [
                            {
                                "city": {
                                    "name": "Sydney"
                                },
                                "country": {
                                    "name": "Australia"
                                }
                            }
                        ]
                    }
                },
                {
                    "name": "Coldplay: Music of the Spheres",
                    "url": "https://www.ticketmaster.com.au/coldplay-music-of-the-spheres-sydney-05-17-2025/event/13005E91CA9D9012",
                    "images": [
                        {
                            "url": "/auth/homepage/assets/images/event.png"
                        }
                    ],
                    "dates": {
                        "start": {
                            "localDate": "2025-05-17"
                        }
                    },
                    "_embedded": {
                        "venues": [
                            {
                                "city": {
                                    "name": "Sydney"
                                },
                                "country": {
                                    "name": "Australia"
                                }
                            }
                        ]
                    }
                },
                {
                    "name": "Bad Bunny: Most Wanted Tour",
                    "url": "https://www.ticketmaster.com.au/bad-bunny-most-wanted-tour-sydney-05-18-2025/event/13005E7AD45B3456",
                    "images": [
                        {
                            "url": "/auth/homepage/assets/images/event.png"
                        }
                    ],
                    "dates": {
                        "start": {
                            "localDate": "2025-05-18"
                        }
                    },
                    "_embedded": {
                        "venues": [
                            {
                                "city": {
                                    "name": "Sydney"
                                },
                                "country": {
                                    "name": "Australia"
                                }
                            }
                        ]
                    }
                },
                {
                    "name": "Adele: Weekend With Adele",
                    "url": "https://www.ticketmaster.com.au/adele-weekend-with-adele-sydney-05-19-2025/event/13005E84BA7D7890",
                    "images": [
                        {
                            "url": "/auth/homepage/assets/images/event.png"
                        }
                    ],
                    "dates": {
                        "start": {
                            "localDate": "2025-05-19"
                        }
                    },
                    "_embedded": {
                        "venues": [
                            {
                                "city": {
                                    "name": "Sydney"
                                },
                                "country": {
                                    "name": "Australia"
                                }
                            }
                        ]
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

document.addEventListener('DOMContentLoaded', function () {
    const fontAwesomeLink = document.querySelector('link[href*="font-awesome"]');
    if (fontAwesomeLink) {
        fontAwesomeLink.removeAttribute('integrity');
        fontAwesomeLink.removeAttribute('crossorigin');
    }

    checkAuthStatus();

    const themeButtons = document.querySelectorAll('.theme-toggle');
    themeButtons.forEach((button) => {
        button.addEventListener('click', toggleTheme);
    });

    const searchForm = document.getElementById('eventSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchFormSubmit);
    }

    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (startDateInput && !startDateInput.value) {
        const today = new Date();
        startDateInput.value = today.toISOString().split('T')[0];
    }

    if (endDateInput && !endDateInput.value) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        endDateInput.value = nextWeek.toISOString().split('T')[0];
    }

    fetchTrendingEvents();
});
