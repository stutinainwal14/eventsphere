$(document).ready(function () {
    // Get auth token
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.href = '/login/login.html';
        return;
    }

    // Function to make authenticated API calls
    async function makeAuthenticatedRequest(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userInfo');
                    window.location.href = '/login/login.html';
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            return null;
        }
    }

    // Load dashboard data
    async function loadDashboardData() {
        try {
            // Fetch total users
            const users = await makeAuthenticatedRequest('/api/admin/users');
            if (users) {
                updateCard('Total Users', users.length);
            }

            // Fetch total events count (more efficient)
            const eventsCountResponse = await makeAuthenticatedRequest('/api/admin/events-count');
            if (eventsCountResponse && typeof eventsCountResponse.count !== 'undefined') {
                updateCard('Total Events', eventsCountResponse.count);
            }

            // Fetch trending events count
            const trendingResponse = await makeAuthenticatedRequest('/api/admin/trending-count');
            if (trendingResponse && typeof trendingResponse.count !== 'undefined') {
                updateCard('Total Trending Events', trendingResponse.count);
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    // Function to update card values
    function updateCard(cardTitle, value) {
        $('.card').each(function () {
            const cardText = $(this).find('p').text();
            if (cardText === cardTitle) {
                $(this).find('h2').text(value);
            }
        });
    }

    // Load data when page loads
    loadDashboardData();

    // Refresh data every 5 minutes
    setInterval(loadDashboardData, 5 * 60 * 1000);
});
