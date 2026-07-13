document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page"); // 'insights', 'trending', etc.

  fetch("../sidebar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("sidebar").innerHTML = data;

      // Set active class after DOM is inserted
      const links = document.querySelectorAll(".sidebar nav a");
      links.forEach(link => {
        if (link.dataset.page === page) {
          link.classList.add("active");
        }
      });

      // Add logout functionality
      setupLogoutHandler();
    })
    .catch(err => console.error("Sidebar load failed", err));
});

function setupLogoutHandler() {
  const logoutLink = document.querySelector(".logout-link");

  if (logoutLink) {
    logoutLink.addEventListener("click", handleLogout);
  }
}

async function handleLogout(e) {
  e.preventDefault();

  // Show confirmation dialog
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (!confirmLogout) {
    return;
  }

  try {
    // Get auth token from localStorage
    const authToken = localStorage.getItem("authToken");

    // Call logout API if token exists
    if (authToken) {
      try {
        await fetch("/api/auth/logout", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
      } catch (apiError) {
        console.warn("Logout API call failed:", apiError);
        // Continue with client-side logout even if API fails
      }
    }

    // Clear all stored authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");

    // Clear any session storage
    sessionStorage.clear();

    // Clear any other authentication-related data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('user') || key.includes('token'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Show logout message
    showLogoutMessage();

    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = "../../login/login.html";
    }, 1500);

  } catch (error) {
    console.error("Logout error:", error);

    // Even if there's an error, clear local storage and redirect
    localStorage.clear();
    sessionStorage.clear();

    alert("Logout completed. Redirecting to login page...");
    window.location.href = "../../login/login.html";
  }
}

function showLogoutMessage() {
  // Create and show a temporary logout message
  const logoutMessage = document.createElement('div');
  logoutMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
  logoutMessage.textContent = "Logged out successfully! Redirecting...";

  document.body.appendChild(logoutMessage);

  // Animate in
  setTimeout(() => {
    logoutMessage.style.opacity = '1';
    logoutMessage.style.transform = 'translateX(0)';
  }, 100);

  // Remove after delay
  setTimeout(() => {
    if (logoutMessage.parentNode) {
      logoutMessage.parentNode.removeChild(logoutMessage);
    }
  }, 2000);
}

// Optional: Add automatic token validation and logout on page load
function validateAuthToken() {
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    // No token found, redirect to login
    window.location.href = "../../login/login.html";
    return;
  }

  // Optional: Validate token with server
  fetch("/api/auth/validate", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Token validation failed');
      }
      return response.json();
    })
    .catch(error => {
      console.warn("Token validation failed:", error);
      // Clear invalid token and redirect
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      window.location.href = "../../login/login.html";
    });
}

// Call token validation when page loads (optional)
document.addEventListener("DOMContentLoaded", () => {
  // Uncomment the line below if you want automatic token validation
  // validateAuthToken();
});