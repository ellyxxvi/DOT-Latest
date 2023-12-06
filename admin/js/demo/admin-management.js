//modal for add user
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addModal").modal("show");
  });
});
const API_PROTOCOL = 'https'
const API_HOSTNAME = 'goexplorebatangas.com/api'
// const API_PROTOCOL = 'http'
// const API_HOSTNAME = '13.229.101.17/api'


document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('tableBody');
  const addButton = document.getElementById('addButton');
  const addModal = new bootstrap.Modal(document.getElementById('addModal'));
  const addAccountButton = document.getElementById('btn-add-account');
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editForm = document.getElementById('edit-user-form');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  // Add this code inside your DOMContentLoaded event listener
  const logoutButton = document.getElementById('logoutButton');

  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('password-toggle');

  passwordToggle.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      passwordToggle.classList.remove('fa-eye-slash'); // Remove the slash
      passwordToggle.classList.add('fa-eye'); // Add the eye icon
    } else {
      passwordInput.type = 'password';
      passwordToggle.classList.remove('fa-eye'); // Remove the eye icon
      passwordToggle.classList.add('fa-eye-slash'); // Add the slash
    }
  });

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('access_token_super_admin');
    localStorage.removeItem('access_token_admin');

    window.location.href = 'login.html';
  });

  const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
  if (!accessToken) {
      window.location.href = 'login.html';
      return; 
  }
  
  const userRole = getUserRoleFromAccessToken();
  
  if (userRole === 'ADMIN') {
      // Hide the navigation items
      const adminManagementNavItem = document.getElementById('adminManagement');
      const userManagementNavItem = document.getElementById('userManagement');
      
      if (adminManagementNavItem) {
          adminManagementNavItem.style.display = 'none';
      }
  
      if (userManagementNavItem) {
          userManagementNavItem.style.display = 'none';
      }
  } else if (userRole !== 'SUPER_ADMIN') {
      window.location.href = 'index.html'; 
      return;
  }

  // Function to fetch and populate the table
  async function populateTable() {
    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const searchUrl = `${API_PROTOCOL}://${API_HOSTNAME}/users?role=ADMIN`;
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }
  
      let data = await response.json();
  
      // Sort data by created_at in descending order (newest first)
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
      tableBody.innerHTML = '';
  
      if (data.length === 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.innerHTML = `
          <td colspan="7" style="text-align: center;">There are no relevant search results.</td>
        `;
        tableBody.appendChild(noResultsRow);
      } else {
        // Populate the table with search results
        data.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.email}</td>
            <td>${maskPassword(user.password)}</td>
            <td>${user.created_at}</td>
            <td>${user.updated_at}</td>
            <!-- ... Other cells ... -->
            <td>
              <button class="btn btn-primary btn-sm edit-button" data-user-id="${user.id}">
                <i class="fa fa-pen"></i>
              </button>
              <button class="btn btn-danger btn-sm delete-button">
                <i class="fa fa-trash"></i>
              </button>
            </td>
          `;
          tableBody.appendChild(row);
        });
      }

      const deleteButtons = document.querySelectorAll('.delete-button');
      const confirmationModal = document.getElementById('confirmationModal');
      const confirmDeleteButton = document.getElementById('confirmDeleteButton');
      const cancelDeleteButton = document.getElementById('cancelDeleteButton');
      let deleteTargetRow = null;

      deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          const button = event.target;
          const row = button.closest('tr');
          const userId = row.querySelector('td:first-child').textContent;

          // Store the target row for deletion
          deleteTargetRow = row;

          // Show the confirmation modal
          confirmationModal.style.display = 'block';
        });
      });

      confirmDeleteButton.addEventListener('click', async () => {
        if (deleteTargetRow) {
          const userId = deleteTargetRow.querySelector('td:first-child').textContent;

          try {
            const accessToken = getAccessTokenFromLocalStorage();
            const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}?role=ADMIN`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              }
            });

            if (response.ok) {
              deleteTargetRow.remove();
            } else {
              const responseData = await response.text();
              console.error(`Error deleting user: ${response.status} ${response.statusText}`, responseData);
            }
          } catch (error) {
            console.error('Error deleting user:', error.message);
          } finally {
            // Hide the confirmation modal
            confirmationModal.style.display = 'none';
          }
        }
      });

      cancelDeleteButton.addEventListener('click', () => {
        // Hide the confirmation modal
        confirmationModal.style.display = 'none';
      });


      const editButtons = document.querySelectorAll('.edit-button');
      editButtons.forEach(button => {
        button.addEventListener('click', editRow);
      });
    } catch (error) {
      console.error('Error fetching and populating data:', error.message);
    }
  }

  // Initial population of the table with all data
  populateTable();



  function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    return accessToken;
  }

  // Function to toggle password visibility
  function togglePasswordVisibility(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const passwordToggle = document.getElementById(toggleId);

    passwordToggle.addEventListener('click', function () {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.classList.remove('fa-eye-slash');
        passwordToggle.classList.add('fa-eye');
      } else {
        passwordInput.type = 'password';
        passwordToggle.classList.remove('fa-eye');
        passwordToggle.classList.add('fa-eye-slash');
      }
    });
  }

  async function editRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userIdCell = row.querySelector('td:first-child');
    const editForm = document.getElementById('edit-user-form');

    if (!userIdCell) {
      console.error('User ID cell not found.');
      return;
    }

    const userId = userIdCell.textContent.trim();
    const passwordInput = editForm.querySelector('#password');
    const newPasswordInput = editForm.querySelector('#new-password');
    const confirmPasswordInput = editForm.querySelector('#confirm-password');

    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}?role=ADMIN`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const responseData = await response.text();
      } else {
        const user = await response.json();

        editForm.elements.id.value = user.id;
        editForm.elements.email.value = user.email;
        passwordInput.value = user.password;

        const updatedUser = {
          first_name: user.first_name || 'TEST',
          last_name: user.last_name || 'TEST',
          gender: user.gender || 'TEST',
          role: 'ADMIN',
          from_country: user.from_country || 'TEST',
          current_province: user.current_province || 'TEST',
          current_city: user.current_city || 'TEST',
        };

        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();

        // togglePasswordVisibility('password', 'password-toggle-edit');

        const changePasswordLink = document.getElementById('change-password-link');
        const changePasswordFields = document.getElementById('change-password-fields');
        changePasswordLink.addEventListener('click', function (e) {
          e.preventDefault();
          changePasswordFields.style.display = 'block';

          // document.getElementById('password-toggle-edit').style.display = 'none';

          togglePasswordVisibility('new-password', 'new-password-toggle');
          togglePasswordVisibility('confirm-password', 'confirm-password-toggle');
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  }

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = new FormData(editForm);
    const updatedUser = {};
    formData.forEach((value, key) => {
      updatedUser[key] = value;
    });
  
    // Remove password-related fields from the request payload if not changing the password
    if (updatedUser['new-password'] === '' && updatedUser['confirm-password'] === '') {
      delete updatedUser['new-password'];
      delete updatedUser['confirm-password'];
    } else {
      // Check if new password and confirm password match
      if (updatedUser['new-password'] !== updatedUser['confirm-password']) {
        alert('New password and confirm password do not match.');
        return;
      }
  
      // Include the password field in the request payload
      updatedUser.password = updatedUser['new-password'];
      delete updatedUser['new-password'];
      delete updatedUser['confirm-password'];
    }
  
    const { id, created_at, updated_at, email, ...validData } = updatedUser;
  
    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const userId = id;
      const putUrl = `${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}?role=ADMIN`;
  
      const response = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(validData),
      });
  
      if (response.ok) {
        editForm.reset();
        editModal.hide();
        // Reload the window
        window.location.reload();
        populateTable();
      } else {
        const responseData = await response.text();
        console.error(`Error updating user: ${response.status} ${response.statusText}`, responseData);
      }
    } catch (error) {
      console.error('Error updating user data:', error.message);
    }
  });
  



  //ADD ADMIN ACCOUNT
  addButton.addEventListener('click', () => {
    addModal.show();
  });

  addAccountButton.addEventListener('click', async () => {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);

    const requiredFields = ['email', 'password'];

    for (const field of requiredFields) {
      if (!formData.has(field) || formData.get(field).trim() === '') {
        alert(`Please fill in the ${field.replace('_', ' ')} field.`);
        return;
      }
    }

    const user = {};
    formData.forEach((value, key) => {
      user[key] = value;
    });
    const date = new Date();
    let currentDay = String(date.getDate()).padStart(2, '0');
    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
    let currentYear = date.getFullYear();
    let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;
    // user['created_at'] = currentDate;

    // Define empty string values for specific properties
    user['first_name'] = "test";
    user['last_name'] = " test";
    user['gender'] = "Female";
    user['role'] = "ADMIN";
    user['from_country'] = "test";
    user['current_province'] = "test";
    user['current_city'] = "test";


    const password = user['password'];
    if (password && password.length < 8) {
      alert('Password must consist of at least 8 characters');
      return;
    }

    const accessToken = getAccessTokenFromLocalStorage();
    try {
      const apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}`;
      const response = await fetch(`${apiUrl}/users?role=ADMIN`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(user)
      });

      if (response.ok) {
        this.location.reload();
        form.reset();
        populateTable();
      } else {
        const responseData = await response.text();
        console.error(`Error adding user: ${response.status} ${response.statusText}`, responseData);
      }
    } catch (error) {
      console.error('Error adding user:', error.message);
    }
  });


  async function deleteRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;

    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}?role=ADMIN`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        row.remove();
      } else {
        const responseData = await response.text();
        console.error(`Error deleting user: ${response.status} ${response.statusText}`, responseData);
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  }


  // Function to mask password
  function maskPassword(password) {
    return '*'.repeat(password ? password.length : 0);
  }

});

// Function to get the user's role from the access token
function getUserRoleFromAccessToken() {
  const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
  if (!accessToken) return null;

  var base64Url = accessToken.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload).role;
}

// Get the user's role and update the UI
var userRole = getUserRoleFromAccessToken();

if (userRole) {
  var userDropdown = document.getElementById('userDropdown');
  var roleElement = userDropdown.querySelector('.role');

  if (userRole === 'SUPER_ADMIN') {
    roleElement.innerText = 'SUPER ADMIN';
  } else if (userRole === 'ADMIN') {
    roleElement.innerText = 'ADMIN/STAFF';
  }
}
