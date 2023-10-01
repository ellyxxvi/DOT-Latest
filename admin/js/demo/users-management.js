// Modal for adding a user
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addModal").modal("show");
  });
});
const API_PROTOCOL = 'https'
const API_HOSTNAME = 'goexplorebatangas.com/api'

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
    let searchUrl = `${API_PROTOCOL}://${API_HOSTNAME}/users?role=REGULAR`;

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Access-Control-Allow-Origin': '*'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      const data = await response.json();

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
            <td><img src=${user.profile_photo} alt=""
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
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}?role=REGULAR`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      const user = await handleErrors(response);

      editForm.elements.id.value = user.id;
      editForm.elements.first_name.value = user.first_name;
      editForm.elements.last_name.value = user.last_name;
      // editForm.elements.gender.value = user.gender;
      // editForm.elements.email.value = user.email;
      // editForm.elements.password.value = user.password;
      editForm.elements.from_country.value = user.from_country;
      editForm.elements.current_province.value = user.current_province;
      editForm.elements.current_city.value = user.current_city;
      editForm.elements.current_barangay.value = user.current_barangay;

      const existingImageURL = user.profile_photo;
      const imagePreview = document.getElementById('edit-image-preview');
      imagePreview.src = existingImageURL;

      editForm.elements.existingImage.value = existingImageURL;

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

    const imageInput = editForm.querySelector('#profile_photo');
    const imageFile = imageInput.files[0];

    try {
      const accessToken = getAccessTokenFromLocalStorage();
      if (imageFile) {
        var formData2 = new FormData();
        formData2.append('photo', imageFile);

        const imageResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData2
        });
        const imageData = await handleErrors(imageResponse);


        updatedUser.profile_photo = imageData.http_img_url;
        await sendEditRequest(updatedUser, accessToken);
      } else {
        updatedUser.profile_photo = editForm.elements.existingImage.value;
        await sendEditRequest(updatedUser, accessToken);
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);

    }
  });

  async function sendEditRequest(updatedUser, accessToken) {
    try {
      // Check if updatedUser has a valid 'id' property
      if (!updatedUser.id) {
        console.error('Missing user ID in the updatedUser object');
        return;
      }
  
      const apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/users/${updatedUser.id}`;
  
      // Create a clean user object with only the relevant fields
      const cleanUser = {
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        password: updatedUser.password,
        from_country: updatedUser.from_country,
        current_province: updatedUser.current_province,
        current_city: updatedUser.current_city,
        current_barangay: updatedUser.current_barangay,
        profile_photo: updatedUser.profile_photo,
      };
  
  
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanUser),
      });
  
  
      // Check for a successful response (HTTP status code 2xx)
      if (response.ok) {
        editForm.reset();
        editModal.hide();
        populateTable();
      } else {
        // Handle any errors returned by the server
        const errorResponse = await response.json();
        console.error('Server Error Response:', JSON.stringify(errorResponse, null, 2));
        throw new Error(`Error updating user data: ${errorResponse.message}`);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }


  addButton.addEventListener('click', () => {
    addModal.show();
  });

  addAccountButton.addEventListener('click', async () => {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);
    const imageInput = form.querySelector("#profile_photo");
    const imageFile = imageInput.files[0];
    const accessToken = getAccessTokenFromLocalStorage();

    if (imageFile) {
      formData.delete('photo');
      formData.append('photo', imageFile);

      var formData2 = new FormData();
      formData2.append('photo', imageFile);

      try {
        const imageResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData2,
        });

        if (!imageResponse.ok) {
          throw new Error('Image upload failed.');
        }

        const imageData = await imageResponse.json();
        const imageDataUrl = imageData.http_img_url;

        formData.delete('photo');
        const user = {
          ...Object.fromEntries(formData.entries()),
          profile_photo: imageDataUrl,
          role: "REGULAR"
        };

        const userResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(user),
        });

        if (!userResponse.ok) {
          throw new Error('User creation failed.');
        }

        this.location.reload();
        form.reset();
        populateTable();
      } catch (error) {
        alert('Password must be at least 9 characters long and email must be in correct format.');
      }
    }
  });

  // Handle delete button
  async function deleteRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;

    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}?role=REGULAR`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
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