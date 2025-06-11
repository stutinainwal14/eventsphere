document.addEventListener('DOMContentLoaded', function () {
    console.log("logout.js is loaded");
    const logoutBtn = document.getElementById('logout-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const logoutSpinner = document.getElementById('logout-spinner');
    const successAlert = document.getElementById('success-alert');

    successAlert.style.display = 'none';

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            console.log('Logging out...');
            logoutSpinner.style.display = 'inline-block';

            fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include' // Send cookies with request
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Logout failed');
                }
                logoutSpinner.style.display = 'none';
                successAlert.style.display = 'block';
                setTimeout(() => {
                    window.location.href = '../homepage/index.html';
                }, 1500);
            })
            .catch((error) => {
                console.error('Logout error:', error);
                logoutSpinner.style.display = 'none';
                alert('Something went wrong while logging out.');
            });
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            window.history.back();
        });
    }
});
