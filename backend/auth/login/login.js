$(document).ready(function () {
  // Security utility functions
  function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  function validateEmail(email) {
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
  }

  function validatePassword(password) {
    // Basic password validation
    return password && password.length >= 6 && password.length <= 128;
  }

  function validate2FAToken(token) {
    // 2FA tokens are typically 6 digits
    return /^[0-9]{6}$/.test(token);
  }

  function detectSQLInjection(input) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\/\*|\*\/|;|'|")/g,
      /(\bOR\b|\bAND\b).*?=.*?=/gi
    ];
    return sqlPatterns.some((pattern) => pattern.test(input));
  }

  function detectXSS(input) {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /vbscript:/gi,
      /expression\s*\(/gi
    ];
    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Real-time input sanitization and validation
  $('#email').on('input blur', function () {
    let value = $(this).val();

    // Sanitize input
    value = sanitizeInput(value);
    $(this).val(value);

    // Validate and show feedback
    if (value.length > 0) {
      if (detectSQLInjection(value) || detectXSS(value)) {
        $(this).addClass('invalid');
        showInputError($(this), 'Invalid characters detected');
        return;
      }

      if (!validateEmail(value)) {
        $(this).addClass('invalid');
        showInputError($(this), 'Please enter a valid email address');
      } else {
        $(this).removeClass('invalid').addClass('valid');
        hideInputError($(this));
      }
    } else {
      $(this).removeClass('invalid valid');
      hideInputError($(this));
    }
  });

  $('#password').on('input blur', function () {
    let value = $(this).val();

    // Check for malicious patterns (but don't sanitize password - preserve original)
    if (detectSQLInjection(value) || detectXSS(value)) {
      $(this).addClass('invalid');
      showInputError($(this), 'Invalid characters detected');
      return;
    }

    if (value.length > 0) {
      if (!validatePassword(value)) {
        $(this).addClass('invalid');
        showInputError($(this), 'Password must be 6-128 characters');
      } else {
        $(this).removeClass('invalid').addClass('valid');
        hideInputError($(this));
      }
    } else {
      $(this).removeClass('invalid valid');
      hideInputError($(this));
    }
  });

  // 2FA token validation
  $(document).on('input blur', '#twofa-token', function () {
    let value = $(this).val();

    // Only allow numeric input
    value = value.replace(/[^0-9]/g, '');
    $(this).val(value);

    if (value.length > 0) {
      if (!validate2FAToken(value)) {
        $(this).addClass('invalid');
        showInputError($(this), '2FA code must be 6 digits');
      } else {
        $(this).removeClass('invalid').addClass('valid');
        hideInputError($(this));
      }
    } else {
      $(this).removeClass('invalid valid');
      hideInputError($(this));
    }
  });

  function showInputError(element, message) {
    let errorDiv = element.parent().find('.input-error');
    if (errorDiv.length === 0) {
      errorDiv = $('<div class="input-error"></div>');
      element.parent().append(errorDiv);
    }
    errorDiv.text(message).show();
  }

  function hideInputError(element) {
    element.parent().find('.input-error').hide();
  }

  function show2FAInput() {
    // Create 2FA input group if it doesn't exist
    if ($('#twofa-group').length === 0) {
      const twofaHTML = `
        <div class="input-group" id="twofa-group">
          <label for="twofa-token">Enter 2FA Code</label>
          <input type="text" id="twofa-token" name="twofa-token"
                 placeholder="000000" required maxlength="6"
                 autocomplete="one-time-code" inputmode="numeric"
                 pattern="[0-9]{6}" />
          <div class="help-text">Enter the 6-digit code from your authenticator app</div>
        </div>
      `;
      // Insert before the login button
      $('#login-btn').parent().before(twofaHTML);
    }

    $('#twofa-group').slideDown();
    $('#twofa-token').focus();
    $('#login-btn').text('Verify & Login');
  }

  function hide2FAInput() {
    $('#twofa-group').slideUp();
    $('#login-btn').text('Log in');
  }

  $('#password-toggle').click(function () {
    const passwordField = $('#password');
    const icon = $(this).find('i');
    passwordField.attr('type', passwordField.attr('type') === 'password' ? 'text' : 'password');
    icon.toggleClass('fa-eye fa-eye-slash');
  });

  function showError(message) {
    // Sanitize error message before displaying
    message = sanitizeInput(message);
    $('#error-alert').text(message).slideDown();
    $('#success-alert').slideUp();
    setTimeout(() => $('#error-alert').slideUp(), 5000);
  }

  function showSuccess(message) {
    // Sanitize success message before displaying
    message = sanitizeInput(message);
    $('#success-alert').text(message).slideDown();
    $('#error-alert').slideUp();
  }

  function resetButton() {
    $('#login-spinner').hide();
    $('#login-btn').prop('disabled', false);
  }

  // Rate limiting variables
  let loginAttempts = 0;
  const maxAttempts = 5;
  let lastAttemptTime = 0;
  const cooldownPeriod = 60000; // 1 minute
  let requires2FA = false; // Track if 2FA is required for current login

  $('#login-form').submit(async function (e) {
    e.preventDefault();

    // Check rate limiting
    const now = Date.now();

    if (loginAttempts >= maxAttempts) {
      const timeSinceLastAttempt = now - lastAttemptTime;

      if (timeSinceLastAttempt < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastAttempt) / 1000);
        showError(`Too many login attempts. Please wait ${remainingTime} seconds.`);
        return;
      }

      // Reset attempts after cooldown
      loginAttempts = 0;
    }


    $('#login-spinner').show();
    $('#login-btn').prop('disabled', true);

    const email = sanitizeInput($('#email').val());
    const password = $('#password').val(); // Don't sanitize password, just validate
    const twofaToken = $('#twofa-token').val();

    // Enhanced client-side validation
    if (!email || !password) {
      showError('Please fill in all fields');
      return resetButton();
    }

    // If 2FA is required but token is missing
    if (requires2FA && !twofaToken) {
      showError('Please enter the 2FA code');
      return resetButton();
    }

    // Security checks
    if (detectSQLInjection(email) || detectXSS(email)) {
      showError('Invalid email format detected');
      loginAttempts++;
      lastAttemptTime = now;
      return resetButton();
    }

    if (detectSQLInjection(password) || detectXSS(password)) {
      showError('Invalid password format detected');
      loginAttempts++;
      lastAttemptTime = now;
      return resetButton();
    }

    if (!validateEmail(email)) {
      showError('Please enter a valid email address');
      return resetButton();
    }

    if (!validatePassword(password)) {
      showError('Password must be between 6-128 characters');
      return resetButton();
    }

    // Validate 2FA token if provided
    if (twofaToken && !validate2FAToken(twofaToken)) {
      showError('2FA code must be 6 digits');
      return resetButton();
    }

    try {
      console.log('Sending request to /api/auth/login');

      const requestBody = {
        email: email.toLowerCase().trim(), // Normalize email
        password
      };

      // Include 2FA token if provided
      if (twofaToken) {
        requestBody.token = twofaToken;
      }

      const response = await fetch("/api/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // CSRF protection header
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if 2FA is required
        if (response.status === 400 && data.message === '2FA token required') {
          requires2FA = true;
          show2FAInput();
          showError('Please enter your 2FA code to continue');
          return resetButton();
        }

        loginAttempts++;
        lastAttemptTime = now;
        throw new Error(data.message || 'Login failed');
      }

      // Reset attempts on successful login
      loginAttempts = 0;
      requires2FA = false;

      // Validate token before storing
      if (data.token && typeof data.token === 'string' && data.token.length > 0) {
        localStorage.setItem("authToken", data.token);

        // Also store user info if needed
        if (data.user) {
          localStorage.setItem("userInfo", JSON.stringify(data.user));
        }

        showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          // Check user role and redirect accordingly
          if (data.user && data.user.role === 'admin') {
            window.location.href = "../../admin/main/admin.html";
          } else {
            window.location.href = "../../dashboard/home.html";
          }
        }, 1000);
      } else {
        throw new Error('Invalid authentication token received');
      }
    } catch (error) {
      showError(error.message || 'An error occurred during login');
      resetButton();
    }
  });

  // Clear 2FA input when email or password changes (new login attempt)
  $('#email, #password').on('input', function () {
    if (requires2FA) {
      requires2FA = false;
      hide2FAInput();
      $('#twofa-token').val('');
    }
  });

  // Auto-submit when 6 digits are entered in 2FA field
  $(document).on('input', '#twofa-token', function () {
    const token = $(this).val();
    if (token.length === 6 && validate2FAToken(token)) {
      // Small delay to allow user to see the complete input
      setTimeout(() => {
        if ($('#twofa-token').val().length === 6) {
          $('#login-form').submit();
        }
      }, 500);
    }
  });

  // Clear stored attempts when page loads (new session)
  $(window).on('beforeunload', function () {
    if (loginAttempts > 0) {
      sessionStorage.setItem('loginAttempts', loginAttempts);
      sessionStorage.setItem('lastAttemptTime', lastAttemptTime);
    }
  });

  // Restore rate limiting state
  const storedAttempts = sessionStorage.getItem('loginAttempts');
  const storedTime = sessionStorage.getItem('lastAttemptTime');
  if (storedAttempts && storedTime) {
    loginAttempts = parseInt(storedAttempts);
    lastAttemptTime = parseInt(storedTime);
  }

  // Focus on email field when page loads
  $('#email').focus();
});