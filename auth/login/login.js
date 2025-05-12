$(document).ready(function () {
    $('#password-toggle').click(function () {
      const passwordField = $('#password');
      const icon = $(this).find('i');
      if (passwordField.attr('type') === 'password') {
        passwordField.attr('type', 'text');
        icon.removeClass('fa-eye').addClass('fa-eye-slash');
      } else {
        passwordField.attr('type', 'password');
        icon.removeClass('fa-eye-slash').addClass('fa-eye');
      }
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
  
    $('#login-form').submit(function (e) {
      e.preventDefault();
  
      $('#login-spinner').show();
      $('#login-btn').prop('disabled', true);
  
      const email = $('#email').val().trim();
      const password = $('#password').val();
  
      if (!email || !password) {
        showError('Please fill in all fields');
        return resetButton();
      }
  
      const users = JSON.parse(localStorage.getItem("mockUsers")) || [];
  
      const match = users.find(user =>
        user.email === email && user.password === password
      );
  
      if (match) {
        localStorage.setItem("token", "mockToken123");
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = "../../dashboard/home.html";
        }, 1000);
      } else {
        showError('Invalid email or password');
        resetButton();
      }
    });
  });
  