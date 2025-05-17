document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.getElementById('logout-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const logoutSpinner = document.getElementById('logout-spinner');
    const successAlert = document.getElementById('success-alert');

    successAlert.style.display = 'none';

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            console.log('Logging out...');
            logoutSpinner.style.display = 'inline-block';
            setTimeout(function () {
                logoutSpinner.style.display = 'none';
                successAlert.style.display = 'block';
                setTimeout(function () {
                    window.location.href = '../homepage/index.html';
                }, 1500);
            }, 1000);
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            window.history.back();
        });
    }
});
