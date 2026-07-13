let users = [];

// Load users when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadUsers();

  // Handle edit form submission
  document.getElementById("editForm").addEventListener("submit", function (e) {
    e.preventDefault();
    updateUser();
  });
});

// Load users from API
async function loadUsers() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login/login.html';
      return;
    }

    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 403) {
      alert('Access denied. Admin privileges required.');
      window.location.href = '../main/dashboard.html';
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    users = await response.json();
    displayUsers();
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Failed to load users. Please try again.');
  }
}

// Display users in table
function displayUsers() {
  const tbody = document.querySelector('.trending-table tbody');
  tbody.innerHTML = '';

  // Filter out admin users - only show regular users
  const regularUsers = users.filter(user => user.role !== 'admin');

  if (regularUsers.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
        No regular users found. Only admin users exist.
      </td>
    `;
    tbody.appendChild(row);
    return;
  }

  regularUsers.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.user_id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>
        <span class="password-hidden">••••••••</span>
        <small class="password-note">Hidden for security</small>
      </td>
      <td><button class="edit-btn" onclick="openModal(${user.user_id})">Edit</button></td>
      <td><button class="delete-btn" onclick="deleteUser(${user.user_id})">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Open modal for editing
function openModal(userId = null) {
  const modal = document.getElementById("editModal");
  const form = document.getElementById("editForm");

  if (userId) {
    // Editing existing user - make sure it's not an admin
    const user = users.find(u => u.user_id === userId);
    if (user) {
      if (user.role === 'admin') {
        alert('Cannot edit admin users for security reasons.');
        return;
      }

      form.querySelector('[name="fullname"]').value = user.username;
      form.querySelector('[name="email"]').value = user.email;
      form.querySelector('[name="password"]').value = ''; // Always empty for security
      form.querySelector('[name="password"]').placeholder = 'Leave empty to keep current password';
      form.setAttribute('data-user-id', userId);
    }
  } else {
    // Adding new user (if needed)
    form.reset();
    form.removeAttribute('data-user-id');
  }

  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
  document.getElementById("editForm").reset();
}

// Update user
async function updateUser() {
  try {
    const form = document.getElementById("editForm");
    const userId = form.getAttribute('data-user-id');
    const token = localStorage.getItem('authToken');

    if (!userId) {
      alert('No user selected for editing');
      return;
    }

    const formData = new FormData(form);
    const updateData = {
      username: formData.get('fullname'),
      email: formData.get('email')
    };

    // Only include password if it was changed
    const password = formData.get('password');
    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update user');
    }

    alert('User updated successfully');
    closeModal();
    loadUsers(); // Reload users to reflect changes
  } catch (error) {
    console.error('Error updating user:', error);
    alert('Failed to update user: ' + error.message);
  }
}

// Delete user
async function deleteUser(userId) {
  // Check if trying to delete an admin user
  const user = users.find(u => u.user_id === userId);
  if (user && user.role === 'admin') {
    alert('Cannot delete admin users for security reasons.');
    return;
  }

  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }

  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete user');
    }

    alert('User deleted successfully');
    loadUsers(); // Reload users to reflect changes
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Failed to delete user: ' + error.message);
  }
}

// Close modal when clicking outside
window.addEventListener("click", function (e) {
  const modal = document.getElementById("editModal");
  if (e.target === modal) {
    closeModal();
  }
});