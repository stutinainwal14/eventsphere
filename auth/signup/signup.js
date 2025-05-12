$(document).ready(function () {
    // Password toggle functionality
    function togglePasswordVisibility(field, button) {
        const type = field.attr('type') === 'password' ? 'text' : 'password';
        field.attr('type', type);

        // Change the eye icon
        const icon = button.find('i');
        icon.toggleClass('fa-eye fa-eye-slash');
    }

    $('#password-toggle').click(function () {
        togglePasswordVisibility($('#password'), $(this));
    });

    $('#confirm-password-toggle').click(function () {
        togglePasswordVisibility($('#confirm-password'), $(this));
    });

    // Password strength meter
    $('#password').on('input', function () {
        const password = $(this).val();
        let strength = 0;

        if (password.length > 0) {
            $('#password-strength, #password-text').show();

            if (password.length >= 8) strength += 1;

            if (/[a-z]/.test(password)) strength += 1;

            if (/[A-Z]/.test(password)) strength += 1;

            if (/\d/.test(password)) strength += 1;

            if (/[^A-Za-z0-9]/.test(password)) strength += 1;

            const meter = $('#password-meter');
            const text = $('#password-text');

            meter.removeClass('strength-weak strength-medium strength-strong');

            if (strength <= 2) {
                meter.addClass('strength-weak');
                text.text('Weak password').css('color', '#ff4d4d');
            } else if (strength <= 4) {
                meter.addClass('strength-medium');
                text.text('Medium password').css('color', '#ffd633');
            } else {
                meter.addClass('strength-strong');
                text.text('Strong password').css('color', '#47d147');
            }
        } else {
            $('#password-strength, #password-text').hide();
        }
    });

    // Form validation
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function validateUsername(username) {
        // Only allow letters, numbers, and underscores, 3-20 characters
        const re = /^[a-zA-Z0-9_]{3,20}$/;
        return re.test(username);
    }

    function validatePassword(password) {
        // At least 8 characters, at least one uppercase letter, one lowercase letter, and one number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return re.test(password);
    }

    function showError(message) {
        $('#error-alert').text(message).slideDown();
        $('#success-alert').slideUp();

        setTimeout(function () {
            $('#error-alert').slideUp();
        }, 5000);
    }

    function showSuccess(message) {
        $('#success-alert').text(message).slideDown();
        $('#error-alert').slideUp();
    }

    function resetButton() {
        $('#signup-spinner').hide();
        $('#signup-btn').prop('disabled', false);
    }

    // Form submission
    $('#signup-form').submit(function (e) {
        e.preventDefault();

        $('#signup-spinner').show();
        $('#signup-btn').prop('disabled', true);

        const fullname = $('#fullname').val().trim();
        const email = $('#email').val().trim();
        const username = $('#username').val().trim();
        const password = $('#password').val();
        const confirmPassword = $('#confirm-password').val();

        if (!fullname || !email || !username || !password || !confirmPassword) {
            showError('Please fill in all required fields');
            resetButton();
            return;
        }

        if (fullname.length < 2) {
            showError('Full name must be at least 2 characters');
            resetButton();
            return;
        }

        if (!validateEmail(email)) {
            showError('Please enter a valid email address');
            resetButton();
            return;
        }

        if (!validateUsername(username)) {
            showError('Username must be 3-20 characters and contain only letters, numbers, and underscores');
            resetButton();
            return;
        }

        if (!validatePassword(password)) {
            showError('Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number');
            resetButton();
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            resetButton();
            return;
        }

        // Simulate API call with timeout (replace with actual API call)
        setTimeout(function () {
            showSuccess('Account created successfully! Redirecting to login page...');

            setTimeout(function () {
                window.location.href = '../login/login.html';
            }, 2000);

        }, 1500);
    });

    // Handle social signup buttons
    $('#google-signup').click(function () {
        showError('Google signup feature coming soon');
    });

    $('#facebook-signup').click(function () {
        showError('Facebook signup feature coming soon');
    });

    $('#apple-signup').click(function () {
        showError('Apple signup feature coming soon');
    });

    // Real-time validation feedback
    $('#email').on('blur', function () {
        const email = $(this).val().trim();
        if (email && !validateEmail(email)) {
            $(this).css('border-color', 'var(--error-color)');
        } else {
            $(this).css('border-color', '');
        }
    });

    $('#username').on('blur', function () {
        const username = $(this).val().trim();
        if (username && !validateUsername(username)) {
            $(this).css('border-color', 'var(--error-color)');
        } else {
            $(this).css('border-color', '');
        }
    });

    $('#confirm-password').on('input', function () {
        const password = $('#password').val();
        const confirmPassword = $(this).val();

        if (confirmPassword && password !== confirmPassword) {
            $(this).css('border-color', 'var(--error-color)');
        } else {
            $(this).css('border-color', '');
        }
    });
});
