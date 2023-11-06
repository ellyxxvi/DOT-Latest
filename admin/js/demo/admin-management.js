//modal for add user
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addModal").modal("show");
  });
});
// const API_PROTOCOL = 'https'
// const API_HOSTNAME = 'goexplorebatangas.com/api'
const API_PROTOCOL = 'http'
const API_HOSTNAME = '13.212.85.80/api'

document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('tableBody');
  const addButton = document.getElementById('addButton');
  const addModal = new bootstrap.Modal(document.getElementById('addModal'));
  const addAccountButton = document.getElementById('btn-add-account');
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editForm = document.getElementById('edit-user-form');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');

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

      const data = await response.json();

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
      deleteButtons.forEach(button => {
        button.addEventListener('click', deleteRow);
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

  searchButton.addEventListener('click', () => {
    const searchKeyword = searchInput.value.trim();
    populateTable(searchKeyword);
  });

  function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token');
    return accessToken;
  }

  async function editRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userIdCell = row.querySelector('td:first-child');

    if (!userIdCell) {
      console.error('User ID cell not found.');
      return;
    }

    const userId = userIdCell.textContent.trim();

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
        editForm.elements.password.value = user.password;

        const updatedUser = {
          first_name: user.first_name || 'TEST',
          last_name: user.last_name || 'TEST',
          gender: user.gender || 'TEST',
          role: 'ADMIN',
          from_country: user.from_country || 'TEST',
          current_province: user.current_province || 'TEST',
          current_city: user.current_city || 'TEST',
          current_barangay: user.current_barangay || 'TEST'
        };

        editModal.show();
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  }

  // Handle edit form submission
  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(editForm);
    const updatedUser = {};
    formData.forEach((value, key) => {
      updatedUser[key] = value;
    });

    // Remove unrecognized keys from the user object
    const { id, created_at, updated_at, ...validData } = updatedUser;

    try {
      const accessToken = getAccessTokenFromLocalStorage();

      const userId = id;
      const putUrl = `${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}?role=ADMIN`;

      // Make the PUT request with valid data
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

        // Optionally, refresh the user table
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
    user['current_barangay'] = "test";
    

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
