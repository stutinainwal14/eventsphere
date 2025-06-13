// Import axios for making HTTP requests
const axios = require('axios');

// Load environment variables from .env file
require('dotenv').config();

const API_BASE = 'https://app.ticketmaster.com/discovery/v2';

// Retrieve your API key from environment variables
const API_KEY = process.env.TICKETMASTER_API_KEY;

// Search events using the Ticketmaster API.
const searchEvents = async ({
 location, keyword, startDateTime,
    endDateTime, sort, countryCode
}) => {
  try {
    // Prepare query parameters with fallbacks for optional fields
    const params = {
      city: location || '',
      keyword: keyword || '',
      sort: sort || '',
      countryCode: countryCode || 'AU',
      apikey: API_KEY
    };

    // Add date filters only if provided to avoid sending empty values
    if (startDateTime) {
      params.startDateTime = startDateTime;
    }

    if (endDateTime) {
      params.endDateTime = endDateTime;
    }

    // Send a GET request to the Ticketmaster API with query params
    const response = await axios.get(`${API_BASE}/events.json`, { params });

    // Return the JSON response from the API
    return response.data;
  } catch (error) {
    // Log errors with additional debugging info if available
    console.error('Error fetching Ticketmaster events:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    // Re-throw a user-friendly error for the caller
    throw new Error('Failed to fetch events from Ticketmaster');
  }
};

// Get detailed information about a single event by ID.
const getEventDetails = async (id) => {
  try {
    // Send GET request to fetch event details
    const response = await axios.get(`${API_BASE}/events/${id}.json`, {
      params: { apikey: API_KEY }
    });
    // Return the detailed event data
    return response.data;
  } catch (error) {
    // Log error message
    console.error('Error fetching event details:', error.message);
    // Re-throw an error to be handled by the caller
    throw new Error('Failed to fetch event details');
  }
};

module.exports = { searchEvents, getEventDetails };
