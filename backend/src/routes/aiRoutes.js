const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { searchEvents } = require('../services/TicketMasterService');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function callGroq(messages, maxTokens = 200, temperature = 0.1) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Groq API error:', response.status, err);
    throw new Error(`Groq API failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Groq unexpected response:', JSON.stringify(data));
    throw new Error('Groq returned empty response');
  }

  return data.choices[0].message.content.trim();
}

async function extractSearchParams(userMessage) {
  try {
    const content = await callGroq([
      {
        role: 'system',
        content: `You are an event search assistant. Extract search parameters from the user message and return ONLY a JSON object with these fields:
        - keyword: string (event type, artist, genre)
        - location: string (city name e.g. "Sydney", "Melbourne", "Adelaide")
        - countryCode: string (always "AU" unless user specifies another country)
        - startDateTime: string (ISO format if mentioned, otherwise null)
        - endDateTime: string (ISO format if mentioned, otherwise null)
        - sort: string ("date,asc" by default)
        Return ONLY valid JSON, no explanation, no markdown.`
      },
      { role: 'user', content: userMessage }
    ], 200, 0.1);

    return JSON.parse(content);
  } catch (err) {
    console.error('extractSearchParams error:', err.message);
    return { keyword: '', location: '', countryCode: 'AU', sort: 'date,asc' };
  }
}

async function formatEventsResponse(events, userMessage) {
  const eventList = events['_embedded']?.events?.slice(0, 5) || [];

  if (eventList.length === 0) {
    return "I couldn't find any events matching your request. Try different keywords or another city.";
  }

  const eventsText = eventList.map((event, i) => {
    const date = event.dates?.start?.localDate || 'TBD';
    const venue = event._embedded?.venues?.[0]?.name || 'Unknown venue';
    const city = event._embedded?.venues?.[0]?.city?.name || '';
    const url = event.url || '#';
    return `${i + 1}. ${event.name} | ${date} | ${venue}${city ? ', ' + city : ''} | ${url}`;
  }).join('\n');

  try {
    const response = await callGroq([
      {
        role: 'system',
        content: `You are a friendly event assistant for EventSphere. Present events conversationally and enthusiastically. Keep it concise. Always mention event name, date and venue.`
      },
      {
        role: 'user',
        content: `User asked: "${userMessage}"\n\nEvents found:\n${eventsText}\n\nPresent these events in a friendly way.`
      }
    ], 500, 0.7);

    return response;
  } catch (err) {
    console.error('formatEventsResponse error:', err.message);
    return `I found ${eventList.length} events for you:\n\n${eventsText}`;
  }
}

router.post('/ask', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    console.log('AI ask:', message);
    console.log('GROQ_API_KEY set:', !!GROQ_API_KEY);

    const searchParams = await extractSearchParams(message);
    console.log('Search params:', searchParams);

    const events = await searchEvents({
      keyword: searchParams.keyword || '',
      location: searchParams.location || '',
      countryCode: searchParams.countryCode || 'AU',
      startDateTime: searchParams.startDateTime || undefined,
      endDateTime: searchParams.endDateTime || undefined,
      sort: searchParams.sort || 'date,asc'
    });

    const aiResponse = await formatEventsResponse(events, message);

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
    console.error('AI route error:', err.message);
    res.status(500).json({ error: 'Failed to process your request. Please try again.' });
  }
});

module.exports = router;
