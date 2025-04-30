const axios = require('axios');
require('dotenv').config();

const API_BASE = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = process.env.TICKETMASTER_API_KEY; // Your API key here

const searchEvents = async ({ location, keyword, startDate }) => {
  try {
    const response = await axios.get(`${API_BASE}/events.json`, {
      params: {
        city: location || 'Sydney',
        keyword: keyword || '',
        startDate: startDate || new Date().toISOString(),
        apikey: API_KEY, // Ensure API key is passed here
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Ticketmaster events:', error.message);
    throw new Error('Failed to fetch events from Ticketmaster');
  }
};

module.exports = { searchEvents };
