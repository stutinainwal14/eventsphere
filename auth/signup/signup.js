$(document).ready(function () {
  $('#password-toggle, #confirm-password-toggle').click(function () {
    const field = $(this).siblings('input');
    const icon = $(this).find('i');
    field.attr('type', field.attr('type') === 'password' ? 'text' : 'password');
    icon.toggleClass('fa-eye fa-eye-slash');
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  }

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
    $('#signup-spinner').hide();
    $('#signup-btn').prop('disabled', false);
  }

  $('#signup-form').submit(async function (e) {
    e.preventDefault();

    $('#signup-spinner').show();
    $('#signup-btn').prop('disabled', true);

    const fullname = $('#fullname').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val();
    const confirmPassword = $('#confirm-password').val();

    if (!fullname || !email || !password || !confirmPassword) {
      showError('Please fill in all required fields');
      return resetButton();
    }

    if (!validateEmail(email)) {
      showError('Please enter a valid email address');
      return resetButton();
    }

    if (!validatePassword(password)) {
      showError('Password must be at least 8 characters and include uppercase, lowercase, and a number');
      return resetButton();
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return resetButton();
    }

    try {
      const response = await fetch("http://localhost:8080/signup", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: fullname,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      showSuccess('Account created! Redirecting to login...');
      setTimeout(() => {
        window.location.href = "../login/login.html";
      }, 1500);
    } catch (error) {
      showError(error.message);
      resetButton();
    }
  });
});
