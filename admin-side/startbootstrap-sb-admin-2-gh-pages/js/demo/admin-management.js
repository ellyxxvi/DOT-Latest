
//modal for add user
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addModal").modal("show");
  });
});

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
  async function populateTable(searchKeyword = '') {
    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const searchUrl = `http://13.229.106.142/users?search=${searchKeyword}`;
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
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
            <td>${user.user_name}</td>
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
      console.error('Error fetching and populating data:', error);
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
    const userId = row.querySelector('td:first-child').textContent;
    try {
      const response = await fetch(`http://localhost:3000/admin/${userId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const user = await response.json();

      const date = new Date();
      let currentDay = String(date.getDate()).padStart(2, '0');
      let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
      let currentYear = date.getFullYear();
      let updated_at = `${currentDay}-${currentMonth}-${currentYear}`;

      editForm.elements.id.value = user.id;
      editForm.elements.user_name.value = user.user_name;
      editForm.elements.email.value = user.email;
      editForm.elements.password.value = user.password;
      editForm.elements.created_at.value = user.created_at;
      editForm.elements.updated_at.value = updated_at;

      editModal.show();
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // Handle edit form submission
  editForm.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(editForm);
    const updatedUser = {};
    formData.forEach((value, key) => {
      updatedUser[key] = value;
    });

    try {
      const response = await fetch(`http://localhost:3000/admin/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      });

      if (response.ok) {
        editForm.reset();
        editModal.hide();
        populateTable(); // Refresh the table to reflect changes
      } else {
        console.error('Error updating user data:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  });

  // Handle form submission and add a new user
  addButton.addEventListener('click', () => {
    addModal.show();
  });

  addAccountButton.addEventListener('click', async () => {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);

    const user = {};
    formData.forEach((value, key) => {
      user[key] = value;
    });
    const date = new Date();
    let currentDay = String(date.getDate()).padStart(2, '0');
    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
    let currentYear = date.getFullYear();
    let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;
    user['created_at'] = currentDate;

    const accessToken = getAccessTokenFromLocalStorage();
    try {
      const response = await fetch('http://localhost:3000/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(user)
      });

      if (response.ok) {
        form.reset();
        populateTable();
      } else {
        console.error('Error adding user:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  });

  async function deleteRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;

    try {
      const response = await fetch(`http://localhost:3000/admin/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        row.remove();
      } else {
        console.error('Error deleting user:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
  // Function to mask password
  function maskPassword(password) {
    return '*'.repeat(password ? password.length : 0);
  }

});
