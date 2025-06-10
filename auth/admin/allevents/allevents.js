let currentPage = 1;
let totalEvents = 0;
const eventsPerPage = 7;
let allEvents = [];

// Function to load all events from Australia
async function loadAllEvents() {
  try {
    console.log('Loading all events...');

    const response = await fetch('/api/admin/all-events', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch events: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Received data:', data);

    allEvents = data.events || [];
    totalEvents = allEvents.length;

    console.log(`Loaded ${totalEvents} events`);

    if (totalEvents === 0) {
      console.log('No events found. Raw response:', data.rawResponse);
    }

    displayEvents(currentPage);
    setupPagination();
  } catch (error) {
    console.error('Error loading events:', error);
    showError(`Failed to load events: ${error.message}`);
  }
}

// Function to display events for current page
function displayEvents(page) {
  console.log(`Displaying events for page ${page}`);
  const tbody = document.querySelector('.trending-table tbody');

  if (!tbody) {
    console.error('Table body not found');
    return;
  }

  tbody.innerHTML = '';

  const startIndex = (page - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const eventsToShow = allEvents.slice(startIndex, endIndex);

  console.log(`Showing events ${startIndex + 1} to ${Math.min(endIndex, totalEvents)} of ${totalEvents}`);

  if (eventsToShow.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No events found</td></tr>';
    return;
  }

  eventsToShow.forEach((event, index) => {
    const row = document.createElement('tr');
    const globalIndex = startIndex + index + 1;

    row.innerHTML = `
      <td>${globalIndex}</td>
      <td>${event.location || 'N/A'}</td>
      <td>${event.name || 'N/A'}</td>
      <td><img src="${event.image || 'https://via.placeholder.com/60'}" alt="Event Image" class="event-img" /></td>
      <td>${event.date || 'N/A'}</td>
      <td>${event.source || 'TicketMaster'}</td>
      <td><a href="${event.link || '#'}" target="_blank">Visit</a></td>
      <td><button class="edit-btn" onclick="openModal('${event.id}')">Edit</button></td>
      <td><button class="delete-btn" onclick="deleteEvent('${event.id}')">Delete</button></td>
    `;

    tbody.appendChild(row);
  });
}

// Function to setup pagination controls
function setupPagination() {
  const totalPages = Math.ceil(totalEvents / eventsPerPage);

  // Remove existing pagination if any
  const existingPagination = document.querySelector('.pagination-container');
  if (existingPagination) {
    existingPagination.remove();
  }

  if (totalPages <= 1) return;

  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-container';

  let paginationHTML = '<div class="pagination">';

  // Previous button
  if (currentPage > 1) {
    paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage - 1})">Previous</button>`;
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="page-btn active">${i}</button>`;
    } else {
      paginationHTML += `<button class="page-btn" onclick="changePage(${i})">${i}</button>`;
    }
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage + 1})">Next</button>`;
  }

  paginationHTML += '</div>';
  paginationHTML += `<div class="pagination-info">Showing ${((currentPage - 1) * eventsPerPage) + 1}-${Math.min(currentPage * eventsPerPage, totalEvents)} of ${totalEvents} events</div>`;

  paginationContainer.innerHTML = paginationHTML;

  // Insert after table container
  const tableContainer = document.querySelector('.table-container');
  if (tableContainer) {
    tableContainer.insertAdjacentElement('afterend', paginationContainer);
  }
}

// Function to change page
function changePage(page) {
  currentPage = page;
  displayEvents(currentPage);
  setupPagination();

  // Scroll to top of table
  const tableContainer = document.querySelector('.table-container');
  if (tableContainer) {
    tableContainer.scrollIntoView({ behavior: 'smooth' });
  }
}

// Function to show error messages
function showError(message) {
  console.error('Showing error:', message);

  // Create or update error message
  let errorDiv = document.querySelector('.error-message');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 10px; margin: 10px 0; border-radius: 4px; border: 1px solid #f5c6cb;';
    const main = document.querySelector('main');
    const tableContainer = document.querySelector('.table-container');
    if (main && tableContainer) {
      main.insertBefore(errorDiv, tableContainer);
    }
  }
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';

  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 10000); // Show error for 10 seconds
}

// Function to delete event
async function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event?')) {
    return;
  }

  try {
    const response = await fetch(`/api/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    // Reload events after deletion
    loadAllEvents();
    alert('Event deleted successfully');
  } catch (error) {
    console.error('Error deleting event:', error);
    alert('Failed to delete event');
  }
}

// Existing modal functions
function openModal(eventId = null) {
  const modal = document.getElementById("editModal");
  if (modal) {
    modal.style.display = "flex";

    if (eventId) {
      // Load event data for editing
      const event = allEvents.find(e => e.id === eventId);
      if (event) {
        const locationInput = document.querySelector('input[name="location"]');
        const nameInput = document.querySelector('input[name="name"]');
        const dateInput = document.querySelector('input[name="date"]');
        const sourceInput = document.querySelector('input[name="source"]');
        const linkInput = document.querySelector('input[name="link"]');

        if (locationInput) locationInput.value = event.location || '';
        if (nameInput) nameInput.value = event.name || '';
        if (dateInput) dateInput.value = event.date || '';
        if (sourceInput) sourceInput.value = event.source || '';
        if (linkInput) linkInput.value = event.link || '';
      }
    }
  }
}

function closeModal() {
  const modal = document.getElementById("editModal");
  if (modal) {
    modal.style.display = "none";
  }

  // Clear form
  const form = document.getElementById("editForm");
  if (form) {
    form.reset();
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  console.log('DOM loaded, initializing...');

  // Check if user is authenticated
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('No auth token found');
    showError('Authentication required. Please log in.');
    return;
  }

  // Load events when page loads
  loadAllEvents();

  // Handle form submission
  const editForm = document.getElementById("editForm");
  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Changes saved (placeholder)");
      closeModal();
    });
  }
});

// Click outside to close modal
window.addEventListener("click", function (e) {
  const modal = document.getElementById("editModal");
  if (modal && e.target === modal) {
    closeModal();
  }
});
