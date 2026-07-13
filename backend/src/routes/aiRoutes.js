const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { searchEvents } = require('../services/TicketMasterService');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ── PARSE AI RESPONSE INTO TICKETMASTER PARAMS ──────────────
async function extractSearchParams(userMessage) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are an event search assistant. Extract search parameters from the user's message and return ONLY a JSON object with these fields:
          - keyword: string (event type, artist, genre e.g. "music", "comedy", "Harry Styles")
          - location: string (city name e.g. "Sydney", "Melbourne", "Adelaide")
          - countryCode: string (always "AU" unless user specifies another country)
          - startDateTime: string (ISO format if user mentions a date, otherwise null)
          - endDateTime: string (ISO format if user mentions an end date, otherwise null)
          - sort: string ("date,asc" by default)
          
          Return ONLY valid JSON, no explanation.`
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.1,
      max_tokens: 200
    })
  });

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  try {
    return JSON.parse(content);
  } catch {
    return { keyword: '', location: '', countryCode: 'AU', sort: 'date,asc' };
  }
}

// ── FORMAT EVENTS INTO READABLE RESPONSE ────────────────────
async function formatEventsResponse(events, userMessage, searchParams) {
  const eventList = events['_embedded']?.events?.slice(0, 5) || [];
  
  if (eventList.length === 0) {
    return "I couldn't find any events matching your request. Try searching with different keywords or a different city.";
  }

  const eventsText = eventList.map((event, i) => {
    const date = event.dates?.start?.localDate || 'TBD';
    const venue = event._embedded?.venues?.[0]?.name || 'Unknown venue';
    const city = event._embedded?.venues?.[0]?.city?.name || '';
    const url = event.url || '#';
    return `${i + 1}. **${event.name}**\n   📅 ${date}\n   📍 ${venue}${city ? ', ' + city : ''}\n   🎟️ ${url}`;
  }).join('\n\n');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are a friendly event recommendation assistant for EventSphere. 
          Present the events in a conversational, helpful way. 
          Keep it concise and enthusiastic. 
          Always mention the event name, date and venue.
          End with an encouraging message to book tickets.`
        },
        {
          role: 'user',
          content: `User asked: "${userMessage}"\n\nI found these events:\n\n${eventsText}\n\nPlease present these events in a friendly conversational way.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// ── MAIN ASK AI ROUTE ────────────────────────────────────────
router.post('/ask', authMiddleware, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Step 1: Extract search params from natural language
    const searchParams = await extractSearchParams(message);

    // Step 2: Search Ticketmaster with extracted params
    const events = await searchEvents({
      keyword: searchParams.keyword || '',
      location: searchParams.location || '',
      countryCode: searchParams.countryCode || 'AU',
      startDateTime: searchParams.startDateTime || undefined,
      endDateTime: searchParams.endDateTime || undefined,
      sort: searchParams.sort || 'date,asc'
    });

    // Step 3: Format response with AI
    const aiResponse = await formatEventsResponse(events, message, searchParams);

    res.json({
      message: aiResponse,
      searchParams,
      eventCount: events['_embedded']?.events?.length || 0,
      events: events['_embedded']?.events?.slice(0, 5).map(event => ({
        id: event.id,
        name: event.name,
        date: event.dates?.start?.localDate,
        venue: event._embedded?.venues?.[0]?.name,
        city: event._embedded?.venues?.[0]?.city?.name,
        image: event.images?.[0]?.url,
        url: event.url
      })) || []
    });

  } catch (err) {
    console.error('AI route error:', err);
    res.status(500).json({ error: 'Failed to process your request. Please try again.' });
  }
});

module.exports = router;
