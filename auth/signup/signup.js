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
  
    $('#confirm-password-toggle').click(function () {
      const confirmField = $('#confirm-password');
      const icon = $(this).find('i');
      if (confirmField.attr('type') === 'password') {
        confirmField.attr('type', 'text');
        icon.removeClass('fa-eye').addClass('fa-eye-slash');
      } else {
        confirmField.attr('type', 'password');
        icon.removeClass('fa-eye-slash').addClass('fa-eye');
      }
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
  
    $('#signup-form').submit(function (e) {
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
  
      let users = JSON.parse(localStorage.getItem("mockUsers")) || [];
  
      if (users.some(u => u.email === email)) {
        showError("Email is already registered");
        return resetButton();
      }
  
      users.push({ fullname, email, password });
      localStorage.setItem("mockUsers", JSON.stringify(users));
  
      showSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = "../login/login.html";
      }, 1500);
    });
  });
  