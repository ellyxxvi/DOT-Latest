// modal for add event
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addEventModal").modal("show");
  });
});

const API_PROTOCOL = 'https'
const API_HOSTNAME = 'goexplorebatangas.com/api'
// const API_PROTOCOL = 'http'
// const API_HOSTNAME = '13.229.101.17/api'


document.addEventListener('DOMContentLoaded', function () {
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

  const tableBody = document.getElementById('tableBody');
  const addButton = document.getElementById('addButton');
  const addEventModal = new bootstrap.Modal(document.getElementById('addEventModal'));
  const addAccountButton = document.getElementById('btn-add-account');
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editForm = document.getElementById('edit-user-form');
  let updatedUser = {};


  const logoutButton = document.getElementById('logoutButton');

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('access_token_super_admin');
    localStorage.removeItem('access_token_admin');

    window.location.href = 'login.html';
  });

  // Check if the user has an access token
  const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
  if (!accessToken) {
    window.location.href = 'login.html';
    return;
  }

  function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    return accessToken;
  }

  // Function to handle errors
  function handleErrors(response) {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return response.json();
  }

  // Fetch data from JSON server and populate the table
  function populateTable() {
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Sort the data by created_at in descending order (newest first)
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        tableBody.innerHTML = '';
        data.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.id}</td>
            <td><img src=${user.images} alt="" class="img-thumbnail" width="100px"></td>
            <td>${user.title}</td>
            <td>${user.description}</td>
            <td>${formatHotlines(user.hotlines)}</td> <!-- Display hotlines here -->
            <td>${user.created_at}</td>
            <td>${user.updated_at}</td>
            
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

        function formatHotlines(hotlines) {
          if (!hotlines) return '';

          let result = '<ul>';
          for (const [name, number] of Object.entries(hotlines)) {
            result += `<li>${name}: ${number}</li>`;
          }
          result += '</ul>';
          return result;
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
              const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go/${userId}?role=ADMIN`, {
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
      })
      .catch(error => {
        console.error('Error fetching or processing data:', error);
        // You can handle the error here, e.g., display an error message to the user
      });
  }

  // handles image uploads
  const addForm = document.getElementById('add-user-form');
  async function editRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;
  
    try {
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go/${userId}`, {
        headers: {
          'Authorization': `Bearer ${getAccessTokenFromLocalStorage()}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching user data. Status: ${response.status}`);
      }
  
      const user = await response.json();
      console.log('Fetched Data for Editing Row:', JSON.stringify(user, null, 2));
  
      editForm.elements.id.value = user.id;
      editForm.elements.title.value = user.title;
      editForm.elements.description.value = user.description;
  
      const existingImageURL = user.images;
      const imagePreview = document.getElementById('edit-image-preview');
      imagePreview.src = existingImageURL;
  
      editForm.elements.existingImage.value = existingImageURL;
  
      await displayHotlinesInEditForm(user.hotlines);
  
      updatedUser.id = user.id;
      editModal.show();
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
  
  async function displayHotlinesInEditForm(hotlines) {
    const hotlinesContainer = document.getElementById('emergencyHotlinesContainer');
    hotlinesContainer.innerHTML = '';
  
    if (hotlines && typeof hotlines === 'object') {
      let index = 0;
  
      for (const [name, number] of Object.entries(hotlines)) {
        const entry = document.createElement('div');
        entry.classList.add('emergency-hotline-entry', 'mb-3');
  
        entry.innerHTML = `
          <input type="text" class="form-control edit-hotline-name" name="hotlineName" value="${name}" placeholder="Name">
          <input type="text" class="form-control edit-hotline-number" name="hotlineNumber" value="${number}" placeholder="Number">
        `;
  
        hotlinesContainer.appendChild(entry);
        index++;
      }
    }
  
    // Log the generated HTML for debugging
    console.log('Generated HTML:', hotlinesContainer.innerHTML);
  }
  


  // Handle edit form submission
  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(editForm);
    const updatedUser = {};

    const userId = formData.get('id');

    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    // Set the user ID in the updatedUser object
    updatedUser.id = userId;

    formData.forEach((value, key) => {
      updatedUser[key] = value;
    });

    const imageInput = editForm.querySelector('input[type="file"]');
    const imageFile = imageInput.files[0];

    if (!imageFile) {
      updatedUser.images = [editForm.elements.existingImage.value];
      await sendEditRequest(updatedUser);
    } else {
      const formData2 = new FormData();
      formData2.append('photo', imageFile);

      try {
        const imageResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAccessTokenFromLocalStorage()}`,
          },
          body: formData2,
        });

        if (!imageResponse.ok) {
          throw new Error('Image upload failed.');
        }

        const imageData = await imageResponse.json();
        console.log('Uploaded image URL:', imageData.http_img_url);

        updatedUser.images = [imageData.http_img_url];
        await sendEditRequest(updatedUser);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    }
  });

  // Function to send the PUT request to update user data
  async function sendEditRequest(updatedUser) {
    try {
      const accessToken = getAccessTokenFromLocalStorage();
      if (!accessToken) {
        console.error('Access token not found.');
        return;
      }

      // Create a clean object with only the expected properties
      const { id, title, description, images } = updatedUser;

      const requestBody = {
        title,
        description,
        images,
      };

      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error(`Error updating item data. Status: ${response.status}`);
        console.error('Error response text:', responseText);
        return;
      }

      const data = await response.json();
      editForm.reset();
      editModal.hide();
      populateTable();
    } catch (error) {
      console.error('Error updating item data:', error);
    }
  }

  // Function to convert 'city' to 'title' using renameObjProperty
  function convertCityToTitle(obj) {
    return renameObjProperty(obj, 'city', 'title');
  }


  // Handle form submission and add new item
  addButton.addEventListener('click', () => {
    addEventModal.show();
  });

  const renameObjProperty = (obj, city, title) => {
    const converted = {
      ...obj,
      [title]: obj[city]
    }

    delete converted[city];

    return converted;
  };


  const addEmergencyHotlineButton = document.getElementById('addEmergencyHotline');
  addEmergencyHotlineButton.addEventListener('click', function () {
    const emergencyHotlineEntry = document.querySelector('.emergency-hotline-entry');
    const clonedEmergencyHotlineEntry = emergencyHotlineEntry.cloneNode(true);

    clonedEmergencyHotlineEntry.querySelector('.emergency-hotline-name').value = '';
    clonedEmergencyHotlineEntry.querySelector('.emergency-hotline-number').value = '';

    const emergencyHotlinesContainer = document.getElementById('emergencyHotlinesContainer');
    emergencyHotlinesContainer.appendChild(clonedEmergencyHotlineEntry);
  });


  addAccountButton.addEventListener('click', async () => {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);
    const imageInput = form.querySelector('#images');
    const imageFile = imageInput.files[0];

    // Get the access token from localStorage
    const accessToken = getAccessTokenFromLocalStorage();

    if (!accessToken) {
      console.error('Access token not found.');
      return;
    }

    // Handle image upload
    let images = [];
    if (imageFile) {
      try {
        const imageFormData = new FormData();
        imageFormData.append('photo', imageFile);

        const imageUploadResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: imageFormData,
        });

        if (!imageUploadResponse.ok) {
          console.error('Image upload failed. Status:', imageUploadResponse.status);
          const errorText = await imageUploadResponse.text();
          console.error('Image upload error response:', errorText);
          throw new Error('Image upload failed.');
        }

        const imageData = await imageUploadResponse.json();
        console.log('Uploaded image URL:', imageData.http_img_url);
        images = [imageData.http_img_url];
      } catch (error) {
        console.error('Image upload error:', error);
        return;
      }
    }

    // Handle emergency hotlines
    const emergencyHotlines = {};
    const emergencyHotlineEntries = document.querySelectorAll('.emergency-hotline-entry');
    emergencyHotlineEntries.forEach(entry => {
      const name = entry.querySelector('.emergency-hotline-name').value;
      const number = entry.querySelector('.emergency-hotline-number').value;
      if (name && number) {
        emergencyHotlines[name] = number;
      }
    });

    // Include emergency hotlines in the user object
    const user = {
      ...renameObjProperty(Object.fromEntries(formData.entries()), 'city', 'title'),
      images,
      hotlines: emergencyHotlines,
    };

    // Remove the 'name' and 'number' properties if they exist
    delete user.name;
    delete user.number;
    // Handle user creation
    try {
      console.log('User data to be sent to the server:', JSON.stringify(user)); // Add this line for logging
      const userCreateResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(user),
      });

      if (!userCreateResponse.ok) {
        console.error('User data could not be added. Status:', userCreateResponse.status);
        const errorText = await userCreateResponse.text();
        console.error('User data error response:', errorText);
        throw new Error('User data could not be added.');
      }

      const userData = await userCreateResponse.json();
      console.log('User response:', userData);
      form.reset();
      this.location.reload();
      populateTable();
    } catch (error) {
      console.error('Error adding user data:', error);
    }
  });





  // Handle delete button
  async function deleteRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;

    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go/${userId}`, {
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


  // Populate the table on page load
  populateTable();

});
function getUserRoleFromAccessToken() {
  const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
  if (!accessToken) return null;

  var base64Url = accessToken.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
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
