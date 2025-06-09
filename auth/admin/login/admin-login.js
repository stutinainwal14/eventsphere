// Hardcoded admin credentials
const adminEmail = "admin@eventsphere.com";
const adminPassword = "admin123";

function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password").value.trim();

  if (emailInput === adminEmail && passwordInput === adminPassword) {
    alert("Login successful!");
    window.location.href = "../main/admin.html"; 
  } else {
    alert("Invalid email or password.");
  }

  return false;
}

function togglePassword() {
  const password = document.getElementById("password");
  const toggle = document.getElementById("togglePassword");

  if (password.type === "password") {
    password.type = "text";
    toggle.textContent = "🙈";
  } else {
    password.type = "password";
    toggle.textContent = "👁️";
  }
}
