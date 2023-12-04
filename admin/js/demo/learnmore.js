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
  const tableBody = document.getElementById('tableBody');
  const addButton = document.getElementById('addButton');
  const addAccountButton = document.getElementById('btn-add-account');
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editForm = document.getElementById('edit-user-form');

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

  // Function to handle errors
  function handleErrors(response) {
    if (!response.ok) {
      // Log the error message from the response
      response.text().then(errorMessage => {
        console.error(`Network response was not ok: ${errorMessage}`);
      });
      throw new Error('Network response was not ok.');
    }
    return response.json();
  }

  function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    return accessToken;
  }

  // Fetch data from JSON server and populate the table
  function populateTable() {
    const accessToken = getAccessTokenFromLocalStorage();
    if (!accessToken) {
      console.error('Access token not found.');
      return;
    }

    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/learn-more`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Access-Control-Allow-Origin': '*'
      }
    })
      .then(handleErrors)
      .then(data => {
        // Sort the data by created_at in descending order (newest first)
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        tableBody.innerHTML = '';
        data.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
          <td>${user.id}</td>
          <td><img src="${user.images}" alt="" class="img-thumbnail" width="100px"></td>
          <td>${user.description}</td>
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
              const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/learn-more/${userId}?role=ADMIN`, {
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
      .catch(error => console.error('Error fetching data:', error));
  }

  // handles image uploads
  const addForm = document.getElementById('add-user-form');


function editRow(event) {
  const button = event.target;
  const row = button.closest('tr');
  const userId = row.querySelector('td:first-child').textContent;
  
  fetch(`${API_PROTOCOL}://${API_HOSTNAME}/learn-more/${userId}`, {
    headers: {
      'Authorization': `Bearer ${getAccessTokenFromLocalStorage()}`,
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching user data. Status: ${response.status}`);
      }
      return response.json();
    })
    .then(user => {
      editForm.elements.id.value = user.id;
      editForm.elements.description.value = user.description;
  
      // Display the existing image URL
      const existingImageURL = user.images;
      const imagePreview = document.getElementById('edit-image-preview');
      imagePreview.src = existingImageURL;

      editForm.elements.existingImage.value = existingImageURL;
  
      editModal.show();
    })
    .catch(error => {
      if (error instanceof SyntaxError) {
        console.error('Error fetching user data: Response is not valid JSON');
      } else if (error.response) { 
        console.error('Error fetching user data:', error);
        error.response.text().then(text => {
          console.error('Detailed error response:', text);
        });
      } else {
        console.error('Error fetching user data:', error);
      }
    });
}

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
    if (key === 'images') {
      updatedUser[key] = [value]; 
    } else if (key !== 'id' && key !== 'existingImage' && key !== 'created_at' && key !== 'updated_at') {
      updatedUser[key] = value;
    }
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


async function sendEditRequest(updatedUser) {
  try {
    const accessToken = getAccessTokenFromLocalStorage();
    if (!accessToken) {
      console.error('Access token not found.');
      return;
    }

    const { id, ...requestBody } = updatedUser;

    const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/learn-more/${id}`, {
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

  // Handle form submission and add a new item
  addAccountButton.addEventListener('click', () => {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);
    const imageInput = form.querySelector("#images");
    const imageFile = imageInput.files[0];
    const accessToken = getAccessTokenFromLocalStorage();

    if (!accessToken) {
      console.error('Access token not found.');
      return;
    }

    if (imageFile) {

      var imageFormData = new FormData();
      imageFormData.append('photo', imageFile);

      fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: imageFormData,
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            console.error('Image upload failed. Status:', response.status);
            return response.text().then(text => {
              console.error('Image upload error response:', text);
              throw new Error('Image upload failed.');
            });
          }
        })
        .then(imageData => {
          console.log('Uploaded image URL:', imageData.http_img_url);

          const user = {
            ...Object.fromEntries(formData.entries()),
            images: [imageData.http_img_url],
          };

          fetch(`${API_PROTOCOL}://${API_HOSTNAME}/learn-more`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(user),
          })
            .then(response => {
              if (response.ok) {
                return response.json();
              } else {
                console.error('User data could not be added. Status:', response.status);
                return response.text().then(text => {
                  console.error('User data error response:', text);
                  throw new Error('User data could not be added.');
                });
              }
            })
            .then(userData => {
              console.log('User response:', userData);
              form.reset();
              this.location.reload();
              populateTable();
            })
            .catch(error => console.error('Error adding user data:', error));
        })
        .catch(error => {
          console.error('Image upload error:', error);
        });
    } else {
      const user = Object.fromEntries(formData.entries());

      fetch(`${API_PROTOCOL}://${API_HOSTNAME}/learn-more`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(user),
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            console.error('User data could not be added. Status:', response.status);
            return response.text().then(text => {
              console.error('User data error response:', text);
              throw new Error('User data could not be added.');
            });
          }
        })
        .then(userData => {
          console.log('User response:', userData);
          this.location.reload();
          form.reset();
          populateTable();
        })
        .catch(error => console.error('Error adding user data:', error));
    }
  });

  // Handle delete button
  async function deleteRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;

    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/learn-more/${userId}`, {
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
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
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
