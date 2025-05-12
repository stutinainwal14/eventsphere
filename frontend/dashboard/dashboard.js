$(document).ready(function () {
    const userData = {
        fullName: localStorage.getItem('fullName') || 'John Doe',
        username: localStorage.getItem('username') || 'johndoe',
        email: localStorage.getItem('email') || 'john.doe@example.com',
        phone: localStorage.getItem('phone') || '+1 123-456-7890',
        location: localStorage.getItem('location') || 'New York, USA',
        bio: localStorage.getItem('bio') || 'Event enthusiast and passionate about connecting people through amazing experiences.'
    };

    $('#profile-name').text(userData.fullName);
    $('#profile-username').text('@' + userData.username);
    $('#profile-email').text(userData.email);
    $('#nav-user-name').text(userData.fullName);

    $('#fullname').val(userData.fullName);
    $('#username').val(userData.username);
    $('#email').val(userData.email);
    $('#phone').val(userData.phone);
    $('#location').val(userData.location);
    $('#bio').val(userData.bio);

    $('#user-profile-dropdown').click(function (e) {
        e.stopPropagation();
        $('#user-dropdown').toggleClass('show');
    });

    $(document).click(function () {
        $('#user-dropdown').removeClass('show');
    });

    $('.profile-tab').click(function () {
        const tabId = $(this).data('tab');

        $('.profile-tab').removeClass('active');
        $('.tab-content').removeClass('active');

        $(this).addClass('active');
        $('#' + tabId).addClass('active');
    });

    $('#sidebar-toggle').click(function () {
        $('#sidebar').toggleClass('show');
    });

    $('#profile-form').submit(function (e) {
        e.preventDefault();

        const newData = {
            fullName: $('#fullname').val(),
            username: $('#username').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            location: $('#location').val(),
            bio: $('#bio').val()
        };

        setTimeout(function () {
            localStorage.setItem('fullName', newData.fullName);
            localStorage.setItem('username', newData.username);
            localStorage.setItem('email', newData.email);
            localStorage.setItem('phone', newData.phone);
            localStorage.setItem('location', newData.location);
            localStorage.setItem('bio', newData.bio);

            $('#profile-name').text(newData.fullName);
            $('#profile-username').text('@' + newData.username);
            $('#profile-email').text(newData.email);
            $('#nav-user-name').text(newData.fullName);

            $('#info-success-alert').text('Profile updated successfully!').fadeIn().delay(3000)
                .fadeOut();
        }, 1000);
    });

    // Password form submission
    $('#password-form').submit(function (e) {
        e.preventDefault();

        const currentPassword = $('#current-password').val();
        const newPassword = $('#new-password').val();
        const confirmPassword = $('#confirm-new-password').val();

        if (!currentPassword || !newPassword || !confirmPassword) {
            $('#password-error-alert').text('All fields are required').fadeIn().delay(3000)
                .fadeOut();
            return;
        }

        if (newPassword !== confirmPassword) {
            $('#password-error-alert').text('New passwords do not match').fadeIn().delay(3000)
                .fadeOut();
            return;
        }

        setTimeout(function () {
            $('#password-form')[0].reset();
            $('#password-meter').css('width', '0%');
            $('#password-text').text('');

            $('#password-success-alert').text('Password updated successfully!').fadeIn().delay(3000)
                .fadeOut();
        }, 1000);
    });

    $('#notification-form').submit(function (e) {
        e.preventDefault();

        const emailNotifications = $('#email-notifications').is(':checked');
        const smsNotifications = $('#sms-notifications').is(':checked');
        const marketingEmails = $('#marketing-emails').is(':checked');
        const newEventAlerts = $('#new-event-alerts').is(':checked');

        localStorage.setItem('emailNotifications', emailNotifications);
        localStorage.setItem('smsNotifications', smsNotifications);
        localStorage.setItem('marketingEmails', marketingEmails);
        localStorage.setItem('newEventAlerts', newEventAlerts);

        $('#notification-success-alert').text('Notification preferences saved!').fadeIn().delay(3000)
            .fadeOut();
    });

    // Password strength meter
    $('#new-password').on('input', function () {
        const password = $(this).val();
        let strength = 0;
        let color = '';
        let message = '';

        if (password.length > 0) {
            if (password.length >= 8) strength += 1;
            if (/[A-Z]/.test(password)) strength += 1;
            if (/[a-z]/.test(password)) strength += 1;
            if (/[0-9]/.test(password)) strength += 1;
            if (/[^A-Za-z0-9]/.test(password)) strength += 1;
            const strengthPercentage = (strength / 5) * 100;

            if (strength <= 1) {
                color = '#f5365c';
                message = 'Very Weak';
            } else if (strength <= 2) {
                color = '#fb6340';
                message = 'Weak';
            } else if (strength <= 3) {
                color = '#ffd600';
                message = 'Medium';
            } else if (strength <= 4) {
                color = '#2dce89';
                message = 'Strong';
            } else {
                color = '#2dce89';
                message = 'Very Strong';
            }

            $('#password-meter').css({
                'width': strengthPercentage + '%',
                'background-color': color
            });

            $('#password-text').text(message);
        } else {
            $('#password-meter').css('width', '0%');
            $('#password-text').text('');
        }
    });

    $('#avatar-upload-input').change(function (e) {
        const file = e.target.files[0];

        if (file) {
            if (!file.type.match('image.*')) {
                $('#info-error-alert').text('Please select an image file').fadeIn().delay(3000)
                    .fadeOut();
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                $('#info-error-alert').text('Image size should not exceed 5MB').fadeIn().delay(3000)
                    .fadeOut();
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;

                $('#profile-avatar-img').attr('src', imageUrl);
                $('#nav-user-avatar').attr('src', imageUrl);

                localStorage.setItem('userAvatar', imageUrl);

                // Show success message
                $('#info-success-alert').text('Profile picture updated!').fadeIn().delay(3000)
                    .fadeOut();
            };

            reader.readAsDataURL(file);
        }
    });

    // Load saved avatar from localStorage
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        $('#profile-avatar-img').attr('src', savedAvatar);
        $('#nav-user-avatar').attr('src', savedAvatar);
    }

    // Delete account button
    $('#delete-account-btn').click(function () {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            setTimeout(function () {
                alert('Your account has been deleted. You will be redirected to the homepage.');

                localStorage.clear();
                window.location.href = '/frontend/login/login.html';
            }, 1000);
        }
    });

    // Download data button
    $('#download-data-btn').click(function () {
        setTimeout(function () {
            const userDataExport = {
                accountInfo: {
                    fullName: userData.fullName,
                    username: userData.username,
                    email: userData.email,
                    phone: userData.phone,
                    location: userData.location,
                    bio: userData.bio
                },
                preferences: {
                    emailNotifications: localStorage.getItem('emailNotifications') === 'true',
                    smsNotifications: localStorage.getItem('smsNotifications') === 'true',
                    marketingEmails: localStorage.getItem('marketingEmails') === 'true',
                    newEventAlerts: localStorage.getItem('newEventAlerts') === 'true'
                }
            };

            const dataStr = JSON.stringify(userDataExport, null, 2);

            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const downloadUrl = URL.createObjectURL(dataBlob);

            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = 'my_eventsphere_data.json';
            downloadLink.click();

            URL.revokeObjectURL(downloadUrl);
        }, 1000);
    });

    $('#email-notifications').prop('checked', localStorage.getItem('emailNotifications') !== 'false');
    $('#sms-notifications').prop('checked', localStorage.getItem('smsNotifications') === 'true');
    $('#marketing-emails').prop('checked', localStorage.getItem('marketingEmails') !== 'false');
    $('#new-event-alerts').prop('checked', localStorage.getItem('newEventAlerts') !== 'false');

    // Cancel buttons functionality
    $('#cancel-info-btn').click(function () {
        $('#fullname').val(userData.fullName);
        $('#username').val(userData.username);
        $('#email').val(userData.email);
        $('#phone').val(userData.phone);
        $('#location').val(userData.location);
        $('#bio').val(userData.bio);
    });

    $('#cancel-password-btn').click(function () {
        $('#password-form')[0].reset();
        $('#password-meter').css('width', '0%');
        $('#password-text').text('');
    });

    $('#cancel-notification-btn').click(function () {
        $('#email-notifications').prop('checked', localStorage.getItem('emailNotifications') !== 'false');
        $('#sms-notifications').prop('checked', localStorage.getItem('smsNotifications') === 'true');
        $('#marketing-emails').prop('checked', localStorage.getItem('marketingEmails') !== 'false');
        $('#new-event-alerts').prop('checked', localStorage.getItem('newEventAlerts') !== 'false');
    });

    // Logout functionality
    $('.logout-btn').click(function (e) {
        e.preventDefault();

        setTimeout(function () {
            window.location.href = '/frontend/login/login.html';
        }, 500);
    });
});
