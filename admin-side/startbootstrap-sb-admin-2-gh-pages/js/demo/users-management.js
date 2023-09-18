// Modal for adding a user
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addModal").modal("show");
  });
});

// User Management Data
document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('tableBody');
  const addButton = document.getElementById('addButton');
  const addModal = new bootstrap.Modal(document.getElementById('addModal'));
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editForm = document.getElementById('edit-user-form');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  const addAccountButton = document.getElementById('btn-add-account');

  // Initial population of the table with all data
  populateTable();

  // Function to handle errors
  async function handleErrors(response) {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return await response.json();
  }

  async function populateTable(searchKeyword = '') {
    const accessToken = getAccessTokenFromLocalStorage();
    let searchUrl = 'http://13.229.106.142/users';

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await handleErrors(response);

      const filteredData = data.filter(user => {
        const keywords = [
          user.first_name,
          user.last_name,
          user.gender,
          user.email,
          user.from_country,
          user.current_province,
          user.current_city,
          user.current_barangay
        ];
        return keywords.some(keyword => keyword.includes(searchKeyword));
      });

      tableBody.innerHTML = '';

      if (filteredData.length === 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.innerHTML = `
          <td colspan="13" style="text-align: center;">There are no relevant search results.</td>
        `;
        tableBody.appendChild(noResultsRow);
      } else {
        filteredData.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.id}</td>
            <td><img src=${user.image} alt=""
              class="img-thumbnail" width="100px"></td>
            <td>${user.first_name}</td>
            <td>${user.last_name}</td>
            <td>${user.gender}</td>
            <td>${user.email}</td>
            <td>${maskPassword(user.password)}</td>
            <td>${user.from_country}</td>
            <td>${user.current_province}</td>
            <td>${user.current_city}</td>
            <td>${user.current_barangay}</td>
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
          console.log(filteredData);
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
      console.error('Error fetching data:', error);
    }
  }

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
      const response = await fetch(`http://13.229.106.142/users`);
      const user = await handleErrors(response);

      const date = new Date();
      let currentDay = String(date.getDate()).padStart(2, '0');
      let currentMonth = String(date.getMonth() + 1).padStart(2, '0');
      let currentYear = date.getFullYear();
      let updated_at = `${currentDay}-${currentMonth}-${currentYear}`;

      editForm.elements.id.value = user.id;
      editForm.elements.first_name.value = user.first_name;
      editForm.elements.last_name.value = user.last_name;
      editForm.elements.gender.value = user.gender;
      editForm.elements.email.value = user.email;
      editForm.elements.password.value = user.password;
      editForm.elements.from_country.value = user.from_country;
      editForm.elements.current_province.value = user.current_province;
      editForm.elements.current_city.value = user.current_city;
      editForm.elements.current_barangay.value = user.current_barangay;
      editForm.elements.created_at.value = user.created_at;
      editForm.elements.updated_at.value = updated_at;

      const existingImageURL = user.image;
      const imagePreview = document.getElementById('edit-image-preview');
      imagePreview.src = existingImageURL;

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

    const imageInput = editForm.querySelector('input[type="file"]');
    const imageFile = imageInput.files[0];

    try {
      if (imageFile) {
        var formData2 = new FormData();
        formData2.append('image', imageFile);

        const imageResponse = await fetch('http://localhost:3001/images', {
          method: 'POST',
          body: formData2
        });
        const imageData = await handleErrors(imageResponse);

        console.log('Uploaded image URL:', imageData.url);

        updatedUser.image = imageData.url;
        await sendEditRequest(updatedUser);
      } else {
        updatedUser.image = editForm.elements.existingImage.value;
        await sendEditRequest(updatedUser);
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  });

  // Function to send the PUT request to update user data
  async function sendEditRequest(updatedUser) {
    try {
      const response = await fetch(`http://13.229.106.142/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      });
      await handleErrors(response);

      editForm.reset();
      editModal.hide();
      populateTable();
    } catch (error) {
      console.error('Error updating item data:', error);
    }
  }

  addButton.addEventListener('click', () => {
    addModal.show();
  });

  addAccountButton.addEventListener('click', async () => {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);
    const imageInput = form.querySelector('input[type="file"]');
    const imageFile = imageInput.files[0];

    if (imageFile) {
      formData.delete('image');
      formData.append('image', imageFile);

      var formData2 = new FormData();
      formData2.append('image', imageFile);

      try {
        const imageResponse = await fetch('http://localhost:3001/images', {
          method: 'POST',
          body: formData2
        });
        const imageData = await handleErrors(imageResponse);

        console.log('Uploaded image URL:', imageData.url);
        const imageDataUrl = imageData.url;

        const date = new Date();
        let currentDay = String(date.getDate()).padStart(2, '0');
        let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
        let currentYear = date.getFullYear();
        let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;

        const user = {
          ...Object.fromEntries(formData.entries()),
          image: imageDataUrl,
          created_at: currentDate
        };

        const userResponse = await fetch('http://13.229.106.142/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user)
        });
        await handleErrors(userResponse);

        form.reset();
        populateTable();
      } catch (error) {
        console.error('Error adding user:', error);
      }
    }
  });

  // Handle delete button
  async function deleteRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;

    try {
      const response = await fetch(`http://13.229.106.142/users/${userId}`, {
        method: 'DELETE'
      });
      await handleErrors(response);

      row.remove();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  // Function to mask password
  function maskPassword(password) {
    return '*'.repeat(password ? password.length : 0);
  }
});
