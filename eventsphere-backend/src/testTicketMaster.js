// testEventbrite.js
const { searchEvents } = require('./services/TicketMasterService');

(async () => {
  try {
    const events = await searchEvents({ location: 'Sydney', keyword: 'Music' });
    console.log(events);
  } catch (error) {
    if (error.response && error.response.data) {
        console.error('❌ Error:', error.response.data);
      } else {
        console.error('❌ Error:', error.message);
      }
  }
})();
