$(document).ready(function () {
    // Toggle password visibility
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

        setTimeout(function () {
            $('#error-alert').slideUp();
        }, 5000);
    }

    function showSuccess(message) {
        $('#success-alert').text(message).slideDown();
        $('#error-alert').slideUp();
    }

    function showInfo(message) {
        $('#error-alert').text(message).removeClass('alert-danger').addClass('alert-info')
            .slideDown();

        setTimeout(function () {
            $('#error-alert').slideUp().removeClass('alert-info').addClass('alert-danger');
        }, 3000);
    }

    function resetButton() {
        $('#login-spinner').hide();
        $('#login-btn').prop('disabled', false);
    }

    // Form submission handling
    $('#login-form').submit(function (e) {
        e.preventDefault();

        $('#login-spinner').show();
        $('#login-btn').prop('disabled', true);

        const username = $('#username').val();
        const password = $('#password').val();

        if (!username || !password) {
            showError('Please fill in all fields');
            resetButton();
            return;
        }

        setTimeout(function () {
            showSuccess('Login successful! Redirecting...');

            setTimeout(function () {
                window.location.href = '/Homepage/index.html';
                resetButton();
            }, 1500);
        }, 1000);
    });

    // Handle social login buttons
    $('#google-login').click(function () {
        showInfo('Google login feature coming soon');
    });

    $('#facebook-login').click(function () {
        showInfo('Facebook login feature coming soon');
    });

    $('#apple-login').click(function () {
        showInfo('Apple login feature coming soon');
    });

});
