function toggleMenu() {
  const menu = document.querySelector('.mobile-menu');
  menu.classList.toggle('show');
}

// Fallback to display static events if API fails
function displayFallbackEvents() {
  const cardRow = document.querySelector('.card-row');

  cardRow.innerHTML = `
    <!-- Card 1: Red -->
    <div class="event-card red">
      <img src="assets/images/event.png" alt="Event Image" class="event-image">
      <div class="card-content">
        <p class="location">
          <i class="fas fa-map-marker-alt"></i> Adelaide, Australia
        </p>
        <h3 class="event-title">Lady Gaga Australia Tour</h3>
        <p class="date">
          <i class="fas fa-calendar-alt"></i> 24 May 2025
          <span class="platform">EventBrite</span>
        </p>
        <div class="card-buttons">
          <button class="bookmark">
            <i class="fas fa-bookmark"></i> BookMark
          </button>
          <button class="start">
            Get Started <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Card 2: Blue -->
    <div class="event-card blue">
      <img src="assets/images/event.png" alt="Event Image" class="event-image">
      <div class="card-content">
        <p class="location">
          <i class="fas fa-map-marker-alt"></i> Adelaide, Australia
        </p>
        <h3 class="event-title">Lady Gaga Australia Tour</h3>
        <p class="date">
          <i class="fas fa-calendar-alt"></i> 24 May 2025
          <span class="platform">EventBrite</span>
        </p>
        <div class="card-buttons">
          <button class="bookmark">
            <i class="fas fa-bookmark"></i> BookMark
          </button>
          <button class="start">
            Get Started <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Card 3: Green -->
    <div class="event-card green">
      <img src="assets/images/event.png" alt="Event Image" class="event-image">
      <div class="card-content">
        <p class="location">
          <i class="fas fa-map-marker-alt"></i> Adelaide, Australia
        </p>
        <h3 class="event-title">Lady Gaga Australia Tour</h3>
        <p class="date">
          <i class="fas fa-calendar-alt"></i>24 May 2025
          <span class="platform">EventBrite</span>
        </p>
        <div class="card-buttons">
          <button class="bookmark">
            <i class="fas fa-bookmark"></i> BookMark
          </button>
          <button class="start">
            Get Started <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Card 4: Pink -->
    <div class="event-card pink">
      <img src="assets/images/event.png" alt="Event Image" class="event-image">
      <div class="card-content">
        <p class="location">
          <i class="fas fa-map-marker-alt"></i> Adelaide, Australia
        </p>
        <h3 class="event-title">Lady Gaga Australia Tour</h3>
        <p class="date">
          <i class="fas fa-calendar-alt"></i> 24 May 2025
          <span class="platform">EventBrite</span>
        </p>
        <div class="card-buttons">
          <button class="bookmark">
            <i class="fas fa-bookmark"></i> BookMark
          </button>
          <button class="start">
            Get Started <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function displayEvents(eventData) {
  const cardRow = document.querySelector('.card-row');

  cardRow.innerHTML = '';

  if (!eventData._embedded || !eventData._embedded.events || eventData._embedded.events.length === 0) {
    console.log('No events found, showing fallbacks');
    displayFallbackEvents();
    return;
  }

  const events = eventData._embedded.events;

  const cardColors = ['red', 'blue', 'green', 'pink'];

  events.slice(0, 4).forEach((event, index) => {
    const venue = event._embedded && event._embedded.venues && event._embedded.venues[0] ?
      `${event._embedded.venues[0].city.name}, ${event._embedded.venues[0].country.name}` :
      'Australia';

    const eventDate = event.dates && event.dates.start ?
      new Date(event.dates.start.localDate).toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) :
      'Upcoming';

    const cardElement = document.createElement('div');
    cardElement.className = `event-card ${cardColors[index % cardColors.length]}`;

    const imageUrl = event.images && event.images.length > 0 ?
      event.images[0].url :
      'assets/images/event.png';

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

    cardRow.appendChild(cardElement);
  });
}

// Alternative approach if in case JSONP fails.
function fetchEventsWithXHR() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/trending-events?countryCode=AU&sort=date,asc', true);

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        displayEvents(data);
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        displayFallbackEvents();
      }
    } else {
      console.error('XHR request failed with status:', xhr.status);
      displayFallbackEvents();
    }
  };

  xhr.onerror = function () {
    console.error('XHR request failed');
    displayFallbackEvents();
  };

  xhr.send();
}

async function fetchTrendingEvents() {
  try {
    fetch('/trending-events?countryCode=AU&sort=date,asc')
      .then(response => response.json())
      .then(data => {
        displayEvents(data);
      })
      .catch(error => {
        console.log('Fetch API failed, falling back to JSONP:', error);
        jsonp('/trending-events?countryCode=AU&sort=date,asc', function (data) {
          if (data) {
            displayEvents(data);
          } else {
            console.error('No data received from API');
            displayFallbackEvents();
          }
        });
      });
  } catch (error) {
    console.error('Error fetching trending events:', error);
    displayFallbackEvents();
  }
}

function updateSectionTitle(countryName = 'Australia') {
  const subtitle = document.querySelector('.popular-events .subtitle');
  subtitle.innerHTML = `<i class="fas fa-search"></i> Popular events trending in ${countryName} right now 🎉`;
}

document.addEventListener('DOMContentLoaded', function () {
  updateSectionTitle('Australia');

  try {
    fetchEventsWithXHR();
  } catch (error) {
    console.error('XHR method failed:', error);
    displayFallbackEvents();
  }

  // Add event listeners for bookmark buttons
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('bookmark') ||
      (e.target.parentElement && e.target.parentElement.classList.contains('bookmark'))) {
      alert('Event added to bookmarks!');
    }
  });
});

// Toggle between dark and light mode
document.querySelectorAll(".theme-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    // Optionally, persist choice in localStorage
    const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", mode);
  });
});

// On load, apply theme from storage
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
});
