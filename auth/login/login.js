$(document).ready(function () {
  $('#password-toggle').click(function () {
    const passwordField = $('#password');
    const icon = $(this).find('i');
    passwordField.attr('type', passwordField.attr('type') === 'password' ? 'text' : 'password');
    icon.toggleClass('fa-eye fa-eye-slash');
  });

  function showError(message) {
    $('#error-alert').text(message).slideDown();
    $('#success-alert').slideUp();
    setTimeout(() => $('#error-alert').slideUp(), 5000);
  }

  function showSuccess(message) {
    $('#success-alert').text(message).slideDown();
    $('#error-alert').slideUp();
  }

  function resetButton() {
    $('#login-spinner').hide();
    $('#login-btn').prop('disabled', false);
  }

  $('#login-form').submit(async function (e) {
    e.preventDefault();
    $('#login-spinner').show();
    $('#login-btn').prop('disabled', true);

    const email = $('#email').val().trim();
    const password = $('#password').val();

    if (!email || !password) {
      showError('Please fill in all fields');
      return resetButton();
    }

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem("token", data.token); // Store JWT
      showSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = "../../dashboard/home.html";
      }, 1000);
    } catch (error) {
      showError(error.message);
      resetButton();
    }
  });
});
