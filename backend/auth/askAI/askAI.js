// Check auth
const tokenValue = getAuthToken();
if (!tokenValue) {
  sessionStorage.setItem('redirectAfterLogin', '/askAI/askAI.html');
  window.location.href = '../login/login.html';
}

// DOM elements - initialized after DOM ready
let chatWindow, chatInput, sendBtn;

document.addEventListener('DOMContentLoaded', () => {
  chatWindow = document.getElementById('chatWindow');
  chatInput = document.getElementById('chatInput');
  sendBtn = document.getElementById('sendBtn');
});

// Theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') document.body.classList.add('dark');

document.getElementById('themeToggle2')?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  const btn = document.getElementById('themeToggle2');
  if(btn) btn.textContent = document.body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark';
});
document.getElementById('themeToggle')?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});



function useSuggestion(el) {
  chatInput.value = el.textContent;
  chatInput.focus();
}

function addMessage(content, isUser, events) {
  const div = document.createElement('div');
  div.className = `chat-message ${isUser ? 'user-message' : 'ai-message'}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = isUser ? '👤' : '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  // Convert **bold** markdown to <strong>
  const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  bubble.innerHTML = `<p>${formatted}</p>`;

  // Add event cards if present
  if (events && events.length > 0) {
    const cards = document.createElement('div');
    cards.className = 'event-cards';
    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <img src="${event.image || 'https://via.placeholder.com/60'}" alt="${event.name}" onerror="this.src='https://via.placeholder.com/60'"/>
        <div class="event-card-info">
          <h4>${event.name}</h4>
          <p>📅 ${event.date || 'TBD'} · 📍 ${event.venue || ''}${event.city ? ', ' + event.city : ''}</p>
          <a href="${event.url}" target="_blank">Get Tickets →</a>
        </div>
      `;
      cards.appendChild(card);
    });
    bubble.appendChild(cards);
  }

  div.appendChild(avatar);
  div.appendChild(bubble);
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'chat-message ai-message';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTyping() {
  document.getElementById('typingIndicator')?.remove();
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  chatInput.value = '';
  sendBtn.disabled = true;

  addMessage(message, true);
  showTyping();

  try {
    const response = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    removeTyping();

    if (data.error) {
      addMessage('Sorry, I had trouble processing that. Please try again.', false);
    } else {
      addMessage(data.message, false, data.events);
    }
  } catch (err) {
    removeTyping();
    addMessage('Something went wrong. Please try again.', false);
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
}
