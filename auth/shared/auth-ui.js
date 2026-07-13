const AUTH_CONFIG = {
  TOKEN_KEY: 'authToken',
  FALLBACK_TOKEN_KEY: 'authtoken',
  PROFILE_URL: '/dashboard/profile/profile.html'
};

function getAuthToken() {
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY) || 
         localStorage.getItem(AUTH_CONFIG.FALLBACK_TOKEN_KEY);
}

function updateAuthUI() {
  const token = getAuthToken();
  const loginBtns = document.querySelectorAll('.login-btn');
  const signupBtns = document.querySelectorAll('.signup-btn');
  const footerLogin = document.querySelector('.footer-login');
  const footerSignup = document.querySelector('.footer-signup');

  if (token) {
    loginBtns.forEach(btn => {
      btn.textContent = 'Profile';
      const parentLink = btn.closest('a');
      if (parentLink) parentLink.href = AUTH_CONFIG.PROFILE_URL;
    });

    signupBtns.forEach(btn => {
      btn.textContent = 'Logout';
      const parent = btn.closest('a');
      if (parent) {
        parent.removeAttribute('href');
        parent.addEventListener('click', handleLogout);
      }
    });

    if (footerLogin) {
      footerLogin.textContent = 'Profile';
      const a = footerLogin.closest('a');
      if (a) a.href = AUTH_CONFIG.PROFILE_URL;
    }

    if (footerSignup) {
      footerSignup.textContent = 'Logout';
      const parent = footerSignup.closest('a');
      if (parent) {
        parent.removeAttribute('href');
        parent.addEventListener('click', handleLogout);
      }
    }
  }
}

function handleLogout(event) {
  if (event) event.preventDefault();
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    .finally(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authtoken');
      localStorage.removeItem('userInfo');
      window.location.href = '/homepage/index.html';
    });
}

document.addEventListener('DOMContentLoaded', updateAuthUI);
