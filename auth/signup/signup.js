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

  function sanitizeName(name) {
    if (typeof name !== 'string') return '';
    return name
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/[^\w\s\-'.]/g, '') // Only allow word chars, spaces, hyphens, apostrophes, periods
      .trim();
  }

  function validateFullName(name) {
    // Name validation: 2-50 chars, letters, spaces, hyphens, apostrophes, periods
    const nameRegex = /^[a-zA-Z\s\-'.]{2,50}$/;
    return nameRegex.test(name) && !(/^\s+$/.test(name)); // Not just whitespace
  }

  function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254 && email.length >= 5;
  }

  function validatePassword(password) {
    // Enhanced password validation
    const minLength = 8;
    const maxLength = 128;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength &&
      password.length <= maxLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers;
  }

  function getPasswordStrength(password) {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push('at least 8 characters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('uppercase letter');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('lowercase letter');

    if (/\d/.test(password)) score += 1;
    else feedback.push('number');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('special character');

    if (password.length >= 12) score += 1;

    return {
      score,
      feedback,
      strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
    };
  }

  function detectSQLInjection(input) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\/\*|\*\/|;)/g,
      /(\bOR\b|\bAND\b).*?=.*?=/gi,
      /('|(\\')|('')|(%27)|(0x27))/gi
    ];
    return sqlPatterns.some(pattern => pattern.test(input));
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
      /expression\s*\(/gi,
      /<svg.*?onload/gi
    ];
    return xssPatterns.some(pattern => pattern.test(input));
  }

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

  // Real-time validation for full name
  $('#fullname').on('input blur', function () {
    let value = sanitizeName($(this).val());
    $(this).val(value);

    if (value.length > 0) {
      if (detectSQLInjection(value) || detectXSS(value)) {
        $(this).addClass('invalid');
        showInputError($(this), 'Invalid characters detected');
        return;
      }

      if (!validateFullName(value)) {
        $(this).addClass('invalid');
        showInputError($(this), 'Name must be 2-50 characters, letters only');
      } else {
        $(this).removeClass('invalid').addClass('valid');
        hideInputError($(this));
      }
    } else {
      $(this).removeClass('invalid valid');
      hideInputError($(this));
    }
  });

  // Real-time validation for email
  $('#email').on('input blur', function () {
    let value = sanitizeInput($(this).val().toLowerCase());
    $(this).val(value);

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

  // Enhanced password strength indicator
  $('#password').on('input', function () {
    const password = $(this).val();
    const strength = getPasswordStrength(password);

    // Update strength meter
    const meter = $('#password-meter');
    const text = $('#password-text');

    meter.removeClass('weak medium strong').addClass(strength.strength);
    meter.css('width', `${(strength.score / 6) * 100}%`);

    if (password.length > 0) {
      if (strength.feedback.length > 0) {
        text.text(`Add: ${strength.feedback.join(', ')}`).addClass('weak-text');
      } else {
        text.text('Strong password!').removeClass('weak-text').addClass('strong-text');
      }
    } else {
      text.text('');
      meter.css('width', '0%');
    }
  });

  $('#password').on('blur', function () {
    const password = $(this).val();

    if (password.length > 0) {
      if (detectSQLInjection(password) || detectXSS(password)) {
        $(this).addClass('invalid');
        showInputError($(this), 'Invalid characters detected');
        return;
      }

      if (!validatePassword(password)) {
        $(this).addClass('invalid');
        showInputError($(this), 'Password must meet all requirements');
      } else {
        $(this).removeClass('invalid').addClass('valid');
        hideInputError($(this));
      }
    }
  });

  // Confirm password validation
  $('#confirm-password').on('input blur', function () {
    const password = $('#password').val();
    const confirmPassword = $(this).val();

    if (confirmPassword.length > 0) {
      if (detectSQLInjection(confirmPassword) || detectXSS(confirmPassword)) {
        $(this).addClass('invalid');
        showInputError($(this), 'Invalid characters detected');
        return;
      }

      if (password !== confirmPassword) {
        $(this).addClass('invalid');
        showInputError($(this), 'Passwords do not match');
      } else {
        $(this).removeClass('invalid').addClass('valid');
        hideInputError($(this));
      }
    } else {
      $(this).removeClass('invalid valid');
      hideInputError($(this));
    }
  });

  $('#password-toggle, #confirm-password-toggle').click(function () {
    const field = $(this).siblings('input');
    const icon = $(this).find('i');
    field.attr('type', field.attr('type') === 'password' ? 'text' : 'password');
    icon.toggleClass('fa-eye fa-eye-slash');
  });

  function showError(message) {
    message = sanitizeInput(message);
    $('#error-alert').text(message).slideDown();
    $('#success-alert').slideUp();
    setTimeout(() => $('#error-alert').slideUp(), 5000);
  }

  function showSuccess(message) {
    message = sanitizeInput(message);
    $('#success-alert').text(message).slideDown();
    $('#error-alert').slideUp();
  }

  function resetButton() {
    $('#signup-spinner').hide();
    $('#signup-btn').prop('disabled', false);
  }

  // Rate limiting for signup attempts
  let signupAttempts = 0;
  const maxSignupAttempts = 3;
  let lastSignupAttempt = 0;
  const signupCooldown = 300000; // 5 minutes

  $('#signup-form').submit(async function (e) {
    e.preventDefault();

    // Check rate limiting
    const now = Date.now();
    if (signupAttempts >= maxSignupAttempts) {
      const timeSinceLastAttempt = now - lastSignupAttempt;
      if (timeSinceLastAttempt < signupCooldown) {
        const remainingTime = Math.ceil((signupCooldown - timeSinceLastAttempt) / 1000 / 60);
        showError(`Too many signup attempts. Please wait ${remainingTime} minutes.`);
        return;
      } else {
        signupAttempts = 0;
      }
    }

    $('#signup-spinner').show();
    $('#signup-btn').prop('disabled', true);

    const fullname = sanitizeName($('#fullname').val());
    const email = sanitizeInput($('#email').val().toLowerCase());
    const password = $('#password').val();
    const confirmPassword = $('#confirm-password').val();

    // Comprehensive validation
    if (!fullname || !email || !password || !confirmPassword) {
      showError('Please fill in all required fields');
      return resetButton();
    }

    // Security checks
    if (detectSQLInjection(fullname) || detectXSS(fullname) ||
      detectSQLInjection(email) || detectXSS(email) ||
      detectSQLInjection(password) || detectXSS(password)) {
      showError('Invalid characters detected in form data');
      signupAttempts++;
      lastSignupAttempt = now;
      return resetButton();
    }

    if (!validateFullName(fullname)) {
      showError('Full name must be 2-50 characters, letters only');
      return resetButton();
    }

    if (!validateEmail(email)) {
      showError('Please enter a valid email address');
      return resetButton();
    }

    if (!validatePassword(password)) {
      showError('Password must be at least 8 characters with uppercase, lowercase, and number');
      return resetButton();
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return resetButton();
    }

    // Additional security: Check for common weak passwords
    const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      showError('Please choose a less common password');
      return resetButton();
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // CSRF protection header
        },
        body: JSON.stringify({
          username: fullname.trim(),
          email: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        signupAttempts++;
        lastSignupAttempt = now;
        throw new Error(data.message || 'Signup failed');
      }

      // Reset attempts on successful signup
      signupAttempts = 0;

      showSuccess('Account created! Redirecting to login...');
      setTimeout(() => {
        window.location.href = "../login/login.html";
      }, 1500);
    } catch (error) {
      showError(error.message || 'An error occurred during signup');
      resetButton();
    }
  });

  // Store rate limiting state
  $(window).on('beforeunload', function () {
    if (signupAttempts > 0) {
      sessionStorage.setItem('signupAttempts', signupAttempts);
      sessionStorage.setItem('lastSignupAttempt', lastSignupAttempt);
    }
  });

  // Restore rate limiting state
  const storedSignupAttempts = sessionStorage.getItem('signupAttempts');
  const storedSignupTime = sessionStorage.getItem('lastSignupAttempt');
  if (storedSignupAttempts && storedSignupTime) {
    signupAttempts = parseInt(storedSignupAttempts);
    lastSignupAttempt = parseInt(storedSignupTime);
  }
});