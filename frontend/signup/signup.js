document.addEventListener('DOMContentLoaded', function () {
    function togglePasswordVisibility(field, button) {
        const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
        field.setAttribute('type', type);

        // Change the eye icon
        const icon = button.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }
    // Password toggle functionality
    const passwordToggle = document.getElementById('password-toggle');
    const passwordField = document.getElementById('password');
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    const confirmPasswordField = document.getElementById('confirm-password');

    // Toggle password visibility
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function () {
            togglePasswordVisibility(passwordField, this);
        });
    }

    // Toggle confirm password visibility
    if (confirmPasswordToggle) {
        confirmPasswordToggle.addEventListener('click', function () {
            togglePasswordVisibility(confirmPasswordField, this);
        });
    }

    // Form submission
    const form = document.getElementById('signup-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const errorAlert = document.getElementById('error-alert');

            // Basic validation
            if (password !== confirmPassword) {
                errorAlert.style.display = 'block';
                errorAlert.textContent = 'Passwords do not match!';
                return;
            }

            // Form would be submitted here
            console.log('Form submitted successfully!');
        });
    }
});
