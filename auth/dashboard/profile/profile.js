$(document).ready(function () {
    let userData = {}; // Will be populated from API

    // Check if user is logged in - FIXED: Check both token variations for compatibility
    const token = localStorage.getItem('authToken') || localStorage.getItem('authtoken');
    if (!token) {
        window.location.href = '/auth/login/login.html';
        return;
    }

    // Load user profile data from backend
    function loadUserProfile() {
        $.ajax({
            url: '/api/auth/profile',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function (response) {
                userData = response.user;
                populateProfileData(userData);
            },
            error: function (xhr) {
                console.error('Error loading profile:', xhr);
                if (xhr.status === 401) {
                    // Clean up both token variations
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authtoken');
                    window.location.href = '/auth/login/login.html';
                } else {
                    $('#info-error-alert').text('Failed to load profile data').fadeIn().delay(3000).fadeOut();
                }
            }
        });
    }

    // Populate profile data in UI
    function populateProfileData(user) {
        // Parse preferences if it's a string
        let preferences = {};
        if (user.preferences) {
            preferences = typeof user.preferences === 'string' ?
                JSON.parse(user.preferences) : user.preferences;
        }

        // Update profile display
        $('#profile-name').text(user.username || 'User');
        $('#profile-username').text('@' + (user.username || 'user'));
        $('#profile-email').text(user.email || '');
        $('#nav-user-name').text(user.username || 'User');

        // Update form fields
        $('#fullname').val(user.username || '');
        $('#username').val(user.username || '');
        $('#email').val(user.email || '');
        $('#phone').val(preferences.phone || '');
        $('#location').val(preferences.location || '');
        $('#bio').val(preferences.bio || '');

        // Update avatar if available
        if (user.avatar) {
            $('#profile-avatar-img').attr('src', user.avatar);
            $('#nav-user-avatar').attr('src', user.avatar);
        }

        // Check 2FA status
        check2FAStatus();
    }

    // Initialize profile loading
    loadUserProfile();

    // Load bookmarked events
    function loadBookmarkedEvents() {
        $('#events-loading').show();
        $('#no-events').hide();
        $('#events-grid').empty();

        $.ajax({
            url: '/api/events/bookmarks',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function (response) {
                $('#events-loading').hide();

                if (response.events && response.events.length > 0) {
                    displayBookmarkedEvents(response.events);
                } else {
                    $('#no-events').show();
                }
            },
            error: function (xhr) {
                $('#events-loading').hide();
                console.error('Error loading bookmarked events:', xhr);
                $('#no-events').show();
            }
        });
    }

    // Display bookmarked events
    function displayBookmarkedEvents(events) {
        const eventsGrid = $('#events-grid');

        events.forEach(event => {
            const eventCard = $(`
            <div class="bookmarked-event-card">
                <img src="${event.image || '/public/homepage/assets/images/event.png'}" alt="${event.name}">
                <div class="bookmarked-event-content">
                    <h4 class="bookmarked-event-title">${event.name}</h4>
                    <div class="bookmarked-event-details">
                        <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                        <p><i class="fas fa-calendar-alt"></i> ${event.date}</p>
                        <p><i class="fas fa-ticket-alt"></i> ${event.platform}</p>
                    </div>
                    <div class="bookmarked-event-actions">
                        <a href="${event.ticketUrl}" target="_blank" class="btn btn-primary btn-sm">
                            Get Tickets
                        </a>
                        <button class="btn btn-outline-danger btn-sm remove-bookmark" data-event-id="${event.id}">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `);

            eventsGrid.append(eventCard);
        });

        // Add remove bookmark functionality
        $('.remove-bookmark').click(function () {
            const eventId = $(this).data('event-id');
            removeBookmark(eventId, $(this).closest('.bookmarked-event-card'));
        });
    }

    // Remove bookmark
    function removeBookmark(eventId, cardElement) {
        if (confirm('Are you sure you want to remove this event from your bookmarks?')) {
            $.ajax({
                url: `/api/events/bookmark/${eventId}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                success: function (response) {
                    cardElement.fadeOut(300, function () {
                        $(this).remove();
                        // Check if no events left
                        if ($('#events-grid').children().length === 0) {
                            $('#no-events').show();
                        }
                    });
                },
                error: function (xhr) {
                    alert('Failed to remove bookmark');
                }
            });
        }
    }

    // Add sidebar navigation functionality
    $('.menu-item[data-section]').click(function (e) {
        e.preventDefault();

        const section = $(this).data('section');

        // Update active menu item
        $('.menu-item').removeClass('active');
        $(this).addClass('active');

        // Hide all sections
        $('.content-card').hide();

        // Show selected section
        if (section === 'my-events') {
            $('#my-events-section').show();
            loadBookmarkedEvents();
        } else {
            // Show the first content card (profile) for other sections
            $('.content-card').first().show();
        }
    });

    // Update the existing dashboard menu item click
    $('.menu-item:not([data-section])').click(function (e) {
        e.preventDefault();

        $('.menu-item').removeClass('active');
        $(this).addClass('active');

        $('.content-card').hide();
        $('.content-card').first().show();
    });

    // Add sidebar navigation functionality
    $('.menu-item').click(function (e) {
        e.preventDefault();

        const section = $(this).data('section');

        // Update active menu item
        $('.menu-item').removeClass('active');
        $(this).addClass('active');

        // Hide all content cards
        $('.content-card').hide();
        $('#my-events-section').hide();

        // Show appropriate section
        if (section === 'my-events') {
            $('#my-events-section').show();
            loadBookmarkedEvents();
        } else {
            // Show profile section for other menu items
            $('.content-card').not('#my-events-section').first().show();
        }
    });

    // User dropdown toggle
    $('#user-profile-dropdown').click(function (e) {
        e.stopPropagation();
        $('#user-dropdown').toggleClass('show');
    });

    $(document).click(function () {
        $('#user-dropdown').removeClass('show');
    });

    // Tab switching
    $('.profile-tab').click(function () {
        const tabId = $(this).data('tab');

        $('.profile-tab').removeClass('active');
        $('.tab-content').removeClass('active');

        $(this).addClass('active');
        $('#' + tabId).addClass('active');
    });

    // Sidebar toggle
    $('#sidebar-toggle').click(function () {
        $('#sidebar').toggleClass('show');
    });

    // 2FA Status Check
    function check2FAStatus() {
        $.ajax({
            url: '/api/auth/profile',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function (response) {
                const twoFactorEnabled = response.user.isTwoFactorEnabled === 1 || response.user.isTwoFactorEnabled === true;
                update2FAStatus(twoFactorEnabled);
            },
            error: function (xhr) {
                console.error('Error checking 2FA status:', xhr);
            }
        });
    }

    // Update 2FA Status Display
    function update2FAStatus(enabled) {
        const statusIndicator = $('#status-indicator');
        const statusText = $('.status-text');
        const setupSection = $('#setup-2fa-section');
        const disableSection = $('#disable-2fa-section');

        if (enabled) {
            statusIndicator.removeClass('disabled').addClass('enabled')
                .html('<i class="fas fa-check-circle"></i> Enabled');
            statusText.text('Two-factor authentication is enabled and protecting your account.');
            setupSection.hide();
            disableSection.show();
        } else {
            statusIndicator.removeClass('enabled').addClass('disabled')
                .html('<i class="fas fa-times-circle"></i> Disabled');
            statusText.text('Two-factor authentication is currently disabled for your account.');
            setupSection.show();
            disableSection.hide();
        }
    }

    // Setup 2FA
    $('#setup-2fa-btn').click(function () {
        $.ajax({
            url: '/api/auth/2fa/setup',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function (response) {
                // Display QR code
                $('#qr-code-container').html(`<img src="${response.qrCode}" alt="QR Code for 2FA">`);
                $('#setup-steps').show();
                $('#initial-2fa-buttons').hide();
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON?.message || 'Failed to setup 2FA';
                $('#twofa-error-alert').text(errorMsg).fadeIn().delay(3000).fadeOut();
            }
        });
    });

    // Verify 2FA Setup
    $('#verify-2fa-form').submit(function (e) {
        e.preventDefault();

        const verificationCode = $('#verification-code').val();

        if (!verificationCode || verificationCode.length !== 6) {
            $('#twofa-error-alert').text('Please enter a valid 6-digit code').fadeIn().delay(3000).fadeOut();
            return;
        }

        $.ajax({
            url: '/api/auth/2fa/verify',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                token: verificationCode
            }),
            success: function (response) {
                $('#twofa-success-alert').text('Two-factor authentication enabled successfully!').fadeIn().delay(3000).fadeOut();

                // Reset form and hide setup
                $('#verification-code').val('');
                $('#setup-steps').hide();
                $('#initial-2fa-buttons').show();

                // Update status
                update2FAStatus(true);
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON?.message || 'Invalid verification code';
                $('#twofa-error-alert').text(errorMsg).fadeIn().delay(3000).fadeOut();
            }
        });
    });

    // Cancel 2FA Setup
    $('#cancel-2fa-setup').click(function () {
        $('#setup-steps').hide();
        $('#initial-2fa-buttons').show();
        $('#verification-code').val('');
        $('#qr-code-container').empty();
    });

    // Disable 2FA
    $('#disable-2fa-btn').click(function () {
        if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
            $.ajax({
                url: '/api/auth/2fa/disable',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                success: function (response) {
                    $('#twofa-success-alert').text('Two-factor authentication has been disabled').fadeIn().delay(3000).fadeOut();
                    update2FAStatus(false);
                },
                error: function (xhr) {
                    const errorMsg = xhr.responseJSON?.message || 'Failed to disable 2FA';
                    $('#twofa-error-alert').text(errorMsg).fadeIn().delay(3000).fadeOut();
                }
            });
        }
    });

    // Update profile form
    $('#profile-form').submit(function (e) {
        e.preventDefault();

        const formData = new FormData();

        // Get form values
        const username = $('#username').val().trim();
        const email = $('#email').val().trim();
        const phone = $('#phone').val().trim();
        const location = $('#location').val().trim();
        const bio = $('#bio').val().trim();

        // Only append non-empty values
        if (username) {
            formData.append('username', username);
        }

        if (email) {
            formData.append('email', email);
        }

        // Include avatar if uploaded
        const avatarFile = $('#avatar-upload-input')[0].files[0];
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        // Add preferences - always include even if empty to allow clearing values
        const preferences = {
            phone: phone,
            location: location,
            bio: bio
        };
        formData.append('preferences', JSON.stringify(preferences));

        // Debug logging
        console.log('Form data being sent:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        $.ajax({
            url: '/api/auth/profile',
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                $('#info-success-alert').text('Profile updated successfully!').fadeIn().delay(3000).fadeOut();

                // Update userData and display
                userData = response.user;
                populateProfileData(userData);
            },
            error: function (xhr) {
                console.error('Profile update error:', xhr);
                console.error('Response text:', xhr.responseText);

                let errorMsg = 'Failed to update profile';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                } else if (xhr.responseJSON && xhr.responseJSON.errors) {
                    errorMsg = xhr.responseJSON.errors.map(err => err.msg).join(', ');
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }

                $('#info-error-alert').text(errorMsg).fadeIn().delay(5000).fadeOut();
            }
        });
    });

    // Password form submission
    $('#password-form').submit(function (e) {
        e.preventDefault();

        const currentPassword = $('#current-password').val();
        const newPassword = $('#new-password').val();
        const confirmPassword = $('#confirm-new-password').val();

        if (!currentPassword || !newPassword || !confirmPassword) {
            $('#password-error-alert').text('All fields are required').fadeIn().delay(3000).fadeOut();
            return;
        }

        if (newPassword !== confirmPassword) {
            $('#password-error-alert').text('New passwords do not match').fadeIn().delay(3000).fadeOut();
            return;
        }

        $.ajax({
            url: '/api/auth/change-password',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            }),
            success: function (response) {
                $('#password-form')[0].reset();
                $('#password-meter').css('width', '0%');
                $('#password-text').text('');
                $('#password-success-alert').text('Password updated successfully!').fadeIn().delay(3000).fadeOut();
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON?.message || 'Failed to update password';
                $('#password-error-alert').text(errorMsg).fadeIn().delay(3000).fadeOut();
            }
        });
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

    // Avatar upload
    $('#avatar-upload-input').change(function (e) {
        const file = e.target.files[0];

        if (file) {
            if (!file.type.match('image.*')) {
                $('#info-error-alert').text('Please select an image file').fadeIn().delay(3000).fadeOut();
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                $('#info-error-alert').text('Image size should not exceed 5MB').fadeIn().delay(3000).fadeOut();
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;
                $('#profile-avatar-img').attr('src', imageUrl);
                $('#nav-user-avatar').attr('src', imageUrl);
            };
            reader.readAsDataURL(file);
        }
    });

    // Delete account button
    $('#delete-account-btn').click(function () {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            $.ajax({
                url: '/api/auth/delete-account',
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                success: function (response) {
                    alert('Your account has been deleted. You will be redirected to the homepage.');
                    localStorage.clear();
                    window.location.href = '/auth/login/login.html';
                },
                error: function (xhr) {
                    const errorMsg = xhr.responseJSON?.message || 'Failed to delete account';
                    alert('Error: ' + errorMsg);
                }
            });
        }
    });

    // Download data button
    $('#download-data-btn').click(function () {
        $.ajax({
            url: '/api/auth/export-data',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function (response) {
                const dataStr = JSON.stringify(response, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const downloadUrl = URL.createObjectURL(dataBlob);

                const downloadLink = document.createElement('a');
                downloadLink.href = downloadUrl;
                downloadLink.download = 'my_eventsphere_data.json';
                downloadLink.click();

                URL.revokeObjectURL(downloadUrl);
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON?.message || 'Failed to export data';
                alert('Error: ' + errorMsg);
            }
        });
    });

    // Cancel buttons functionality
    $('#cancel-info-btn').click(function () {
        populateProfileData(userData); // Reset to original data
    });

    $('#cancel-password-btn').click(function () {
        $('#password-form')[0].reset();
        $('#password-meter').css('width', '0%');
        $('#password-text').text('');
    });

    // Logout functionality
    $('.logout-btn').click(function (e) {
        e.preventDefault();
        // Clean up both token variations
        localStorage.removeItem('authToken');
        localStorage.removeItem('authtoken');
        window.location.href = '/auth/login/login.html';
    });
});