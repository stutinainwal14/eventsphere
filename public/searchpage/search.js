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

// Displays event cards in search results
function displayEvents(eventData) {
    const eventsList = document.getElementById('eventsList');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('noResults');

    loading.style.display = 'none';

    eventsList.innerHTML = '';

    if (!eventData._embedded || !eventData._embedded.events || eventData._embedded.events.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    const events = eventData._embedded.events;
    const cardColors = ['red', 'blue', 'green', 'pink'];

    // Creates an event card for each event
    events.forEach((event, index) => {
        const venue = event._embedded && event._embedded.venues && event._embedded.venues[0] ?
            `${event._embedded.venues[0].city.name}, ${event._embedded.venues[0].country.name}` :
            'Location not specified';

        // Format event date
        const eventDate = event.dates && event.dates.start ?
            new Date(event.dates.start.localDate).toLocaleDateString('en-AU', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) :
            'Date TBA';

        // Card element
        const cardElement = document.createElement('div');
        cardElement.className = `event-card ${cardColors[index % cardColors.length]}`;

        // Gets image URL
        const imageUrl = event.images && event.images.length > 0 ?
            event.images[0].url :
            '/public/homepage/assets/images/event.png';

        // Creates card in HTML
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

        // Adds the card to results
        eventsList.appendChild(cardElement);
    });
}

function fetchMockEvents() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    // Simulate API delay
    setTimeout(() => {
        const mockData = getMockEventData();
        displayEvents(mockData);
    }, 800);
}

// Mock event data for demo
function getMockEventData() {
    return {
        "_embedded": {
            "events": [
                {
                    "name": "Ed Sheeran: Mathematics Tour",
                    "url": "https://www.ticketmaster.com.au/ed-sheeran-mathematics-tour-sydney-05-14-2025/event/13005E8D8B681234",
                    "images": [
                        {
                            "url": "/public/homepage/assets/images/event.png"
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
                            "url": "/public/homepage/assets/images/event.png"
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
                            "url": "/public/homepage/assets/images/event.png"
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
                            "url": "/public/homepage/assets/images/event.png"
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
                            "url": "/public/homepage/assets/images/event.png"
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

// Form submission
function handleSearchFormSubmit(event) {
    event.preventDefault();

    const location = document.getElementById('location').value;
    const keyword = document.getElementById('keyword').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const sort = document.getElementById('sort').value;

    const resultsHeading = document.querySelector('.results-heading');
    resultsHeading.textContent = `${keyword || 'All'} Events in ${location || 'All Locations'}`;

    fetchMockEvents();

    console.log('Search parameters:', {
        location: location,
        keyword: keyword,
        sort: sort,
        startDate: startDate ? new Date(startDate).toISOString() : '',
        endDate: endDate ? new Date(endDate).toISOString() : ''
    });
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

    const themeButtons = document.querySelectorAll('.theme-toggle');
    themeButtons.forEach(button => {
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

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('bookmark') ||
            (e.target.parentElement && e.target.parentElement.classList.contains('bookmark'))) {
            alert('Event added to bookmarks!');
        }
    });

    fetchMockEvents();
});
