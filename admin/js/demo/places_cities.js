// modal for add event
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addEventModal").modal("show");
  });
});

const API_PROTOCOL = 'https'
const API_HOSTNAME = 'kentjordan.xyz/api'

document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('tableBody');
  const addButton = document.getElementById('addButton');
  const addEventModal = new bootstrap.Modal(document.getElementById('addEventModal'));
  const addAccountButton = document.getElementById('btn-add-account');
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editForm = document.getElementById('edit-user-form');
  let updatedUser = {};

  function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token');
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
        tableBody.innerHTML = '';
        data.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
          <td>${user.id}</td>
          <td><img src=${user.images} alt=""
          class="img-thumbnail" width="100px"></td>
          <td>${user.title}</td>
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
        deleteButtons.forEach(button => {
          button.addEventListener('click', deleteRow);
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
// Modified editRow function
function editRow(event) {
  const button = event.target;
  const row = button.closest('tr');
  const userId = row.querySelector('td:first-child').textContent;
  
  fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go/${userId}`, {
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
      editForm.elements.title.value = user.title;
      editForm.elements.description.value = user.description;

      // Display the existing image URL
      const existingImageURL = user.images;
      const imagePreview = document.getElementById('edit-image-preview');
      imagePreview.src = existingImageURL;

      // Store the existing image URL in a hidden input field
      editForm.elements.existingImage.value = existingImageURL;

      // Set the id property in the updatedUser object
      updatedUser.id = user.id;
      editModal.show();
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });
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

  // Handle form submission and add new item
  addAccountButton.addEventListener('click', () => {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);
    const imageInput = addForm.querySelector('#images');
    const imageFile = imageInput.files[0];

    // Get the access token from localStorage
    const accessToken = getAccessTokenFromLocalStorage();

    if (!accessToken) {
      console.error('Access token not found.');
      return;
    }

    if (imageFile) {
      const imageFormData = new FormData();
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
            ...renameObjProperty(Object.fromEntries(formData.entries()), 'city', 'title'),
            images: [imageData.http_img_url],
          };

          fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go`, {
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

      fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go`, {
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
          // location.reload();
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
