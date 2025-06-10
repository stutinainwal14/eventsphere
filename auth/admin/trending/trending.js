// Function to fetch trending events from the server
async function fetchTrendingEvents() {
  try {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');

    if (!token) {
      // Fixed the redirect path - use absolute path from root
      window.location.href = '../../login/login.html';
      return;
    }

    // Optional: Check if user role is stored and is admin
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/auth/login.html';
        return;
      }
    }

    // The /trending-events endpoint doesn't require auth, so we can call it without Authorization header
    const response = await fetch('/trending-events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    displayTrendingEvents(data);
  } catch (error) {
    console.error('Error fetching trending events:', error);
    showError('Failed to load trending events. Please try again.');
  }
}

// Function to display trending events in the table
function displayTrendingEvents(data) {
  const tbody = document.querySelector('.trending-table tbody');

  // Clear existing content (remove the placeholder row)
  tbody.innerHTML = '';

  // Check if we have events data
  if (!data || !data._embedded || !data._embedded.events || data._embedded.events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="no-events">No trending events found</td></tr>';
    return;
  }

  const events = data._embedded.events;

  events.forEach((event, index) => {
    const row = document.createElement('tr');

    // Extract event details
    const eventId = event.id || (index + 1);
    const eventName = event.name || 'N/A';
    const eventDate = event.dates?.start?.localDate || 'N/A';
    const eventTime = event.dates?.start?.localTime || '';
    const displayDate = eventTime ? `${eventDate} ${eventTime}` : eventDate;

    // Get venue information
    let location = 'N/A';
    if (event._embedded?.venues && event._embedded.venues.length > 0) {
      const venue = event._embedded.venues[0];
      location = venue.city?.name || venue.name || 'N/A';
      if (venue.state?.name) {
        location += `, ${venue.state.name}`;
      }
    }

    // Get event image
    let imageUrl = 'https://via.placeholder.com/60';
    if (event.images && event.images.length > 0) {
      // Find a suitable image (prefer smaller ones for table display)
      const image = event.images.find(img => img.width <= 100) || event.images[0];
      imageUrl = image.url;
    }

    // Get event URL
    const eventUrl = event.url || '#';

    // Determine source (TicketMaster in this case)
    const source = 'TicketMaster';

    row.innerHTML = `
      <td>${eventId}</td>
      <td>${location}</td>
      <td title="${eventName}">${truncateText(eventName, 30)}</td>
      <td><img src="${imageUrl}" alt="Event Image" class="event-img" onerror="this.src='https://via.placeholder.com/60'" /></td>
      <td>${displayDate}</td>
      <td>${source}</td>
      <td><a href="${eventUrl}" target="_blank" rel="noopener noreferrer">Visit</a></td>
      <td><button class="edit-btn" onclick="openModal('${eventId}', '${escapeQuotes(eventName)}', '${escapeQuotes(location)}', '${eventDate}', '${escapeQuotes(eventUrl)}')">Edit</button></td>
      <td><button class="delete-btn" onclick="deleteEvent('${eventId}')">Delete</button></td>
    `;

    tbody.appendChild(row);
  });
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Helper function to escape quotes for HTML attributes
function escapeQuotes(str) {
  return str.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

// Function to show error messages
function showError(message) {
  const tbody = document.querySelector('.trending-table tbody');
  tbody.innerHTML = `<tr><td colspan="9" class="error-message" style="color: red; text-align: center; padding: 20px;">${message}</td></tr>`;
}

// Open the modal with event data for editing
function openModal(eventId = '', eventName = '', location = '', date = '', url = '') {
  const modal = document.getElementById("editModal");
  const form = document.getElementById("editForm");

  // Populate form fields if editing existing event
  if (eventId) {
    form.querySelector('input[name="location"]').value = location.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    form.querySelector('input[name="name"]').value = eventName.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    form.querySelector('input[name="date"]').value = date;
    form.querySelector('input[name="link"]').value = url.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    form.querySelector('input[name="source"]').value = 'TicketMaster';
  } else {
    form.reset();
  }

  modal.style.display = "flex";
}

// Close the modal
function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

// Delete event function (placeholder - implement according to your backend)
function deleteEvent(eventId) {
  if (confirm('Are you sure you want to delete this event?')) {
    // TODO: Implement delete functionality with your backend
    console.log('Deleting event:', eventId);
    alert('Delete functionality not implemented yet');
  }
}

// Hook into form submission
document.getElementById("editForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const eventData = {
    location: formData.get('location'),
    name: formData.get('name'),
    date: formData.get('date'),
    source: formData.get('source'),
    link: formData.get('link')
  };

  // TODO: Implement save functionality with your backend
  console.log('Saving event data:', eventData);
  alert("Changes saved (placeholder - implement backend logic)!");
  closeModal();
});

// Close modal when clicking outside
window.addEventListener("click", function (e) {
  const modal = document.getElementById("editModal");
  if (e.target === modal) {
    closeModal();
  }
});

// Load trending events when the page loads
document.addEventListener('DOMContentLoaded', function () {
  fetchTrendingEvents();
});

// Optional: Add refresh functionality
function refreshTrendingEvents() {
  fetchTrendingEvents();
}