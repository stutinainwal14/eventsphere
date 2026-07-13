document.addEventListener('DOMContentLoaded', () => {

  // ── AUTH ──────────────────────────────────────────────────
  const tokenValue = localStorage.getItem('authToken') || localStorage.getItem('authtoken');
  if (!tokenValue) {
    sessionStorage.setItem('redirectAfterLogin', '/askAI/askAI.html');
    window.location.href = '../login/login.html';
    return;
  }

  // ── THEME ─────────────────────────────────────────────────
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });

  document.getElementById('themeToggle2')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });

  // ── DOM ELEMENTS ──────────────────────────────────────────
  const chatWindow = document.getElementById('chatWindow');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');

  // ── SUGGESTIONS ───────────────────────────────────────────
  window.useSuggestion = function(el) {
    chatInput.value = el.textContent;
    chatInput.focus();
  };

  // ── CHAT FUNCTIONS ────────────────────────────────────────
  function addMessage(content, isUser, events) {
    const div = document.createElement('div');
    div.className = `chat-message ${isUser ? 'user-message' : 'ai-message'}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? '👤' : '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    bubble.innerHTML = `<p>${formatted}</p>`;

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
            <p>�� ${event.date || 'TBD'} · 📍 ${event.venue || ''}${event.city ? ', ' + event.city : ''}</p>
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
          'Authorization': `Bearer ${tokenValue}`
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

  // ── EVENT LISTENERS ───────────────────────────────────────
  sendBtn?.addEventListener('click', sendMessage);
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // ── AUTH UI UPDATE ────────────────────────────────────────
  const loginBtns = document.querySelectorAll('.login-btn');
  const signupBtns = document.querySelectorAll('.signup-btn');

  loginBtns.forEach(btn => {
    btn.textContent = 'Profile';
    const parentLink = btn.closest('a');
    if (parentLink) parentLink.href = '/dashboard/profile/profile.html';
  });

  signupBtns.forEach(btn => {
    btn.textContent = 'Logout';
    const parent = btn.closest('a');
    if (parent) {
      parent.removeAttribute('href');
      parent.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('authtoken');
        localStorage.removeItem('userInfo');
        window.location.href = '/homepage/index.html';
      });
    }
  });

});
