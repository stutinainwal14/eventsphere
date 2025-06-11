$(document).ready(function () {
    let userData = {}; // Will be populated from API
    let searchTimeout;

    // Check if user is logged in - Check both token variations for compatibility
    const token = localStorage.getItem('authToken') || localStorage.getItem('authtoken');
    if (!token) {
        window.location.href = '/auth/login/login.html';
        return;
    }

    // Initialize the application
    init();

    function init() {
        loadUserProfile();
        setupEventHandlers();
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
                    cleanupAndRedirectToLogin();
                } else {
                    showAlert('#info-error-alert', 'Failed to load profile data');
                }
            }
        });
    }

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

        // Update avatar - Only update if not showing preview
        updateAvatarDisplay(user.avatar);

        // Check 2FA status
        check2FAStatus();
    }

    function updateAvatarDisplay(avatarUrl) {
        if (avatarUrl && !$('#profile-avatar-img').attr('data-preview')) {
            $('#profile-avatar-img').attr('src', avatarUrl);
            $('#nav-user-avatar').attr('src', avatarUrl);
        } else if (!avatarUrl && !$('#profile-avatar-img').attr('data-preview')) {
            // Set default avatar if no avatar and no preview
            const defaultAvatar = '/public/homepage/assets/images/default-avatar.png';
            $('#profile-avatar-img').attr('src', defaultAvatar);
            $('#nav-user-avatar').attr('src', defaultAvatar);
        }
    }

    // Event Handlers Setup
    function setupEventHandlers() {
        // Sidebar navigation
        $('.menu-item').on('click', handleMenuItemClick);

        // User dropdown
        $('#user-profile-dropdown').on('click', toggleUserDropdown);
        $(document).on('click', closeUserDropdown);

        // Tab switching
        $('.profile-tab').on('click', handleTabSwitch);

        // Sidebar toggle
        $('#sidebar-toggle').on('click', toggleSidebar);

        // Search functionality
        $('#search-events-btn').on('click', handleSearch);
        $('#clear-search-btn').on('click', clearSearch);
        $('#event-search, #tag-search').on('keypress', handleSearchKeypress);
        $('#event-search, #tag-search').on('input', handleRealTimeSearch);

        // 2FA functionality
        $('#setup-2fa-btn').on('click', setup2FA);
        $('#verify-2fa-form').on('submit', verify2FA);
        $('#cancel-2fa-setup').on('click', cancel2FASetup);
        $('#disable-2fa-btn').on('click', disable2FA);

        // Form submissions
        $('#profile-form').on('submit', handleProfileUpdate);
        $('#password-form').on('submit', handlePasswordUpdate);

        // Password strength meter
        $('#new-password').on('input', updatePasswordStrength);

        // Avatar upload
        $('#avatar-upload-input').on('change', handleAvatarUpload);

        // Account actions
        $('#delete-account-btn').on('click', handleAccountDeletion);
        $('#download-data-btn').on('click', handleDataDownload);

        // Cancel buttons
        $('#cancel-info-btn').on('click', resetProfileForm);
        $('#cancel-password-btn').on('click', resetPasswordForm);

        // Logout - Single handler to prevent double execution
        $('.logout-btn').on('click', handleLogout);
    }

    // Menu Item Click Handler
    function handleMenuItemClick(e) {
        e.preventDefault();

        const section = $(this).data('section');
        const isLogout = $(this).hasClass('logout-btn');

        // Handle logout separately
        if (isLogout) {
            handleLogout(e);
            return;
        }

        // Update active menu item
        $('.menu-item').removeClass('active');
        $(this).addClass('active');

        // Hide all content sections
        $('.content-card').hide();
        $('#my-events-section').hide();

        // Show appropriate section
        if (section === 'my-events') {
            $('#my-events-section').show();
            loadBookmarkedEvents();
        } else {
            $('.content-card').not('#my-events-section').first().show();
        }
    }

    // User Dropdown Handlers
    function toggleUserDropdown(e) {
        e.stopPropagation();
        $('#user-dropdown').toggleClass('show');
    }

    function closeUserDropdown() {
        $('#user-dropdown').removeClass('show');
    }

    // Tab Switch Handler
    function handleTabSwitch() {
        const tabId = $(this).data('tab');
        $('.profile-tab').removeClass('active');
        $('.tab-content').removeClass('active');
        $(this).addClass('active');
        $('#' + tabId).addClass('active');
    }

    // Sidebar Toggle
    function toggleSidebar() {
        $('#sidebar').toggleClass('show');
    }

    // Search Handlers
    function handleSearch() {
        const searchQuery = $('#event-search').val().trim();
        const tagFilter = $('#tag-search').val().trim();
        loadBookmarkedEvents(searchQuery, tagFilter);
    }

    function handleSearchKeypress(e) {
        if (e.which === 13) { // Enter key
            handleSearch();
        }
    }

    function handleRealTimeSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            const searchQuery = $('#event-search').val().trim();
            const tagFilter = $('#tag-search').val().trim();

            // Only auto-search if there's some input
            if (searchQuery || tagFilter) {
                loadBookmarkedEvents(searchQuery, tagFilter);
            }
        }, 500); // Wait 500ms after user stops typing
    }

    function clearSearch() {
        $('#event-search').val('');
        $('#tag-search').val('');
        $('#search-results-info').hide();
        loadBookmarkedEvents();
    }

    // Bookmarked Events Functions
    function loadBookmarkedEvents(searchQuery = '', tagFilter = '') {
        console.log('Loading bookmarked events...', { searchQuery, tagFilter });

        // Clear existing content first
        $('#events-grid').empty();
        $('#events-loading').show();
        $('#no-events').hide();
        $('#search-results-info').hide();

        // Use search endpoint if filters are provided, otherwise use regular bookmarks endpoint
        let url = '/api/events/bookmarks';
        let params = {};

        if (searchQuery || tagFilter) {
            url = '/api/events/saved/search';
            params = { q: searchQuery, tags: tagFilter };
        }

        $.ajax({
            url: url,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: params,
            success: function (response) {
                $('#events-loading').hide();

                let events = [];
                if (url.includes('/saved/search')) {
                    events = response || [];
                } else {
                    events = response.events || [];
                }

                // Update search results info
                if (searchQuery || tagFilter) {
                    updateSearchResultsInfo(events.length, searchQuery, tagFilter);
                }

                if (events.length > 0) {
                    displayBookmarkedEvents(events);
                } else {
                    showNoEventsMessage(searchQuery || tagFilter);
                }
            },
            error: function (xhr) {
                $('#events-loading').hide();
                console.error('Error loading bookmarked events:', xhr);
                showNoEventsMessage(false, true);
            }
        });
    }

    function updateSearchResultsInfo(count, searchQuery, tagFilter) {
        const resultsInfo = $('#search-results-info');
        const resultsCount = $('#results-count');
        const activeFilters = $('#active-filters');

        resultsCount.text(count);

        let filterText = '';
        if (searchQuery && tagFilter) {
            filterText = `for "${searchQuery}" with tags "${tagFilter}"`;
        } else if (searchQuery) {
            filterText = `for "${searchQuery}"`;
        } else if (tagFilter) {
            filterText = `with tags "${tagFilter}"`;
        }

        activeFilters.text(filterText);
        resultsInfo.show();
    }

    function displayBookmarkedEvents(events) {
        const eventsGrid = $('#events-grid');
        eventsGrid.empty();

        events.forEach(event => {
            const eventData = {
                id: event.id || event.event_id,
                name: event.name || 'Unknown Event',
                location: event.location || event.address?.line1 || 'Unknown Location',
                date: event.date || 'Date TBA',
                image: event.image || '/public/homepage/assets/images/event.png',
                ticketUrl: event.ticketUrl || event.url || '#',
                platform: event.platform || event.source || 'Unknown Platform',
                event_id: event.event_id || event.id
            };

            const eventCard = createEventCard(eventData);
            eventsGrid.append(eventCard);
        });

        // Add remove bookmark functionality
        $('.remove-bookmark').on('click', function () {
            const eventId = $(this).data('event-id');
            const eventDbId = $(this).data('event-db-id');
            const cardElement = $(this).closest('.bookmarked-event-card');
            const idToUse = eventId || eventDbId;
            removeBookmark(idToUse, cardElement);
        });
    }

    function createEventCard(eventData) {
        return $(`
            <div class="bookmarked-event-card">
                <img src="${eventData.image}" alt="${eventData.name}"
                     onerror="this.src='/public/homepage/assets/images/event.png'">
                <div class="bookmarked-event-content">
                    <h4 class="bookmarked-event-title">${eventData.name}</h4>
                    <div class="bookmarked-event-details">
                        <p><i class="fas fa-map-marker-alt"></i> ${eventData.location}</p>
                        <p><i class="fas fa-calendar-alt"></i> ${eventData.date}</p>
                        <p><i class="fas fa-ticket-alt"></i> ${eventData.platform}</p>
                    </div>
                    <div class="bookmarked-event-actions">
                        <a href="${eventData.ticketUrl}" target="_blank" class="btn btn-primary btn-sm">
                            Get Tickets
                        </a>
                        <button class="btn btn-outline-danger btn-sm remove-bookmark"
                                data-event-id="${eventData.id}"
                                data-event-db-id="${eventData.event_id}">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `);
    }

    function showNoEventsMessage(hasFilters, isError = false) {
        const noEventsDiv = $('#no-events');

        if (isError) {
            noEventsDiv.html(`
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
                <h4 style="color: #dc3545; margin-bottom: 0.5rem;">Error Loading Events</h4>
                <p style="color: #6c757d;">There was an error loading your bookmarked events. Please try again.</p>
                <button onclick="loadBookmarkedEvents()" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-refresh"></i> Retry
                </button>
            `);
        } else if (hasFilters) {
            noEventsDiv.html(`
                <i class="fas fa-search" style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"></i>
                <h4 style="color: #6c757d; margin-bottom: 0.5rem;">No Events Found</h4>
                <p style="color: #6c757d;">No events match your search criteria. Try different keywords or tags.</p>
                <button id="clear-search-from-no-results" class="btn btn-secondary" style="margin-top: 1rem;">
                    <i class="fas fa-times"></i> Clear Search
                </button>
            `);

            $('#clear-search-from-no-results').on('click', clearSearch);
        } else {
            noEventsDiv.html(`
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"></i>
                <h4 style="color: #6c757d; margin-bottom: 0.5rem;">No Bookmarked Events</h4>
                <p style="color: #6c757d;">You haven't bookmarked any events yet. Browse events and save your favorites!</p>
                <a href="../home.html" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-search"></i> Browse Events
                </a>
            `);
        }

        noEventsDiv.show();
    }

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

    // 2FA Functions
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

    function setup2FA() {
        $.ajax({
            url: '/api/auth/2fa/setup',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function (response) {
                $('#qr-code-container').html(`<img src="${response.qrCode}" alt="QR Code for 2FA">`);
                $('#setup-steps').show();
                $('#initial-2fa-buttons').hide();
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON?.message || 'Failed to setup 2FA';
                showAlert('#twofa-error-alert', errorMsg);
            }
        });
    }

    function verify2FA(e) {
        e.preventDefault();

        const verificationCode = $('#verification-code').val();

        if (!verificationCode || verificationCode.length !== 6) {
            showAlert('#twofa-error-alert', 'Please enter a valid 6-digit code');
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
                showAlert('#twofa-success-alert', 'Two-factor authentication enabled successfully!');

                // Reset form and hide setup
                $('#verification-code').val('');
                $('#setup-steps').hide();
                $('#initial-2fa-buttons').show();

                // Update status
                update2FAStatus(true);
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON?.message || 'Invalid verification code';
                showAlert('#twofa-error-alert', errorMsg);
            }
        });
    }

    function cancel2FASetup() {
        $('#setup-steps').hide();
        $('#initial-2fa-buttons').show();
        $('#verification-code').val('');
        $('#qr-code-container').empty();
    }

    function disable2FA() {
        if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
            $.ajax({
                url: '/api/auth/2fa/disable',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                success: function (response) {
                    showAlert('#twofa-success-alert', 'Two-factor authentication has been disabled');
                    update2FAStatus(false);
                },
                error: function (xhr) {
                    const errorMsg = xhr.responseJSON?.message || 'Failed to disable 2FA';
                    showAlert('#twofa-error-alert', errorMsg);
                }
            });
        }
    }

    // Form Handlers
    function handleProfileUpdate(e) {
        e.preventDefault();

        const formData = new FormData();

        // Get form values
        const username = $('#username').val().trim();
        const email = $('#email').val().trim();
        const phone = $('#phone').val().trim();
        const location = $('#location').val().trim();
        const bio = $('#bio').val().trim();

        // Only append non-empty values
        if (username) formData.append('username', username);
        if (email) formData.append('email', email);

        // Include avatar if uploaded
        const avatarFile = $('#avatar-upload-input')[0].files[0];
        if (avatarFile) formData.append('avatar', avatarFile);

        // Add preferences - always include even if empty to allow clearing values
        const preferences = { phone, location, bio };
        formData.append('preferences', JSON.stringify(preferences));

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
                showAlert('#info-success-alert', 'Profile updated successfully!');

                // Update userData and display
                userData = response.user;

                // Clear preview flags and file input
                $('#profile-avatar-img, #nav-user-avatar').removeAttr('data-preview');
                $('#avatar-upload-input').val('');

                populateProfileData(userData);
            },
            error: function (xhr) {
                console.error('Profile update error:', xhr);
                let errorMsg = 'Failed to update profile';

                if (xhr.responseJSON?.message) {
                    errorMsg = xhr.responseJSON.message;
                } else if (xhr.responseJSON?.errors) {
                    errorMsg = xhr.responseJSON.errors.map(err => err.msg).join(', ');
                } else if (xhr.responseJSON?.error) {
                    errorMsg = xhr.responseJSON.error;
                }

                showAlert('#info-error-alert', errorMsg, 5000);
            }
        });
    }

    function handlePasswordUpdate(e) {
        e.preventDefault();

        const currentPassword = $('#current-password').val();
        const newPassword = $('#new-password').val();
        const confirmPassword = $('#confirm-new-password').val();

        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert('#password-error-alert', 'All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert('#password-error-alert', 'New passwords do not match');
            return;
        }

        $.ajax({
            url: '/api/auth/update-password',
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                oldPassword: currentPassword,
                newPassword: newPassword
            }),
            success: function (response) {
                resetPasswordForm();
                showAlert('#password-success-alert', 'Password updated successfully!');
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON?.message || 'Failed to update password';
                showAlert('#password-error-alert', errorMsg);
            }
        });
    }

    function updatePasswordStrength() {
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
    }

    function handleAvatarUpload(e) {
        const file = e.target.files[0];

        if (file) {
            if (!file.type.match('image.*')) {
                showAlert('#info-error-alert', 'Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showAlert('#info-error-alert', 'Image size should not exceed 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;
                // Set preview image
                $('#profile-avatar-img, #nav-user-avatar')
                    .attr('src', imageUrl)
                    .attr('data-preview', 'true');
            };
            reader.readAsDataURL(file);
        }
    }

    // Account Management
    function handleAccountDeletion() {
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
    }

    function handleDataDownload() {
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
    }

    // Form Reset Functions
    function resetProfileForm() {
        populateProfileData(userData); // Reset to original data
    }

    function resetPasswordForm() {
        $('#password-form')[0].reset();
        $('#password-meter').css('width', '0%');
        $('#password-text').text('');
    }

    // Logout Handler - Single consolidated function
    function handleLogout(e) {
        e.preventDefault();

        // Prevent multiple executions
        if ($(e.target).hasClass('logging-out')) {
            return;
        }

        $(e.target).addClass('logging-out');

        fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        })
            .then(res => {
                if (res.ok) {
                    cleanupAndRedirectToLogin();
                    alert('You have been logged out successfully');
                } else {
                    throw new Error('Logout failed');
                }
            })
            .catch(err => {
                console.error('Logout error:', err);
                alert('Failed to log out. Try again.');
            })
            .finally(() => {
                $(e.target).removeClass('logging-out');
            });
    }

    // Utility Functions
    function cleanupAndRedirectToLogin() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authtoken');
        window.location.href = '/auth/login/login.html';
    }

    function showAlert(selector, message, duration = 3000) {
        $(selector).text(message).fadeIn().delay(duration).fadeOut();
    }
});