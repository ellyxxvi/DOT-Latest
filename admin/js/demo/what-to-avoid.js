

// modal for add event
$(document).ready(function () {
  $("#addButton1").click(function () {
    $("#addEventModal1").modal("show");
  });
});

const API_PROTOCOL = 'https'
const API_HOSTNAME = 'goexplorebatangas.com/api'
// const API_PROTOCOL = 'http'
// const API_HOSTNAME = '13.229.101.17/api'

//   THINGS TO BRING 
document.addEventListener('DOMContentLoaded', function () {
  const tableBody1 = document.getElementById('tableBody1');
  const addButton1 = document.getElementById('addButton1');
  const addEventModal1 = new bootstrap.Modal(document.getElementById('addEventModal1'));
  const addAccountButton1 = document.getElementById('btn-add-account1');
  const editModal1 = new bootstrap.Modal(document.getElementById('editModal1'));
  const editForm1 = document.getElementById('edit-user-form1');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
    // Function to handle errors
    function handleErrors(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    }

    
  function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token');
    return accessToken;
  }

    function populateTable(searchKeyword = '') {
      let searchUrl = `${API_PROTOCOL}://${API_HOSTNAME}/things-to-avoid`;
    
      fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
          const filteredData = data.filter(user => {
            return user.title.includes(searchKeyword) || user.description.includes(searchKeyword);
          });
    
          tableBody1.innerHTML = '';
    
          if (filteredData.length === 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `
              <td colspan="7" style="text-align: center;">There are no relevant search results.</td>
            `;
            tableBody1.appendChild(noResultsRow);
          } else {
            filteredData.forEach(user => {
              const row = document.createElement('tr');
              row.innerHTML = `
                <td>${user.id}</td>
                <td><img src="${user.images}" alt="" class="img-thumbnail" width="100px"></td>
                <td>${user.title}</td>
                <td>${user.description}</td>
                <td>${user.created_at}</td>
                <td>${user.updated_at}</td>
                <!-- ... Other cells ... -->
                <td>
                  <button class="btn btn-primary btn-sm edit-button1" data-user-id="${user.id}">
                    <i class="fa fa-pen"></i>
                  </button>
                  <button class="btn btn-danger btn-sm delete-button">
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              `;
              tableBody1.appendChild(row);
            });
          }
    
          const deleteButtons = document.querySelectorAll('.delete-button');
          deleteButtons.forEach(button => {
            button.addEventListener('click', deleteRow);
          });
    
          const editButtons = document.querySelectorAll('.edit-button1');
          editButtons.forEach(button => {
            button.addEventListener('click', editRow1);
          });
    
        })
        .catch(error => console.error('Error fetching data:', error));
    }
    
  populateTable();

  searchButton.addEventListener('click', () => {
    const searchKeyword = searchInput.value.trim();
    console.log('Search keyword:', searchKeyword);
    populateTable(searchKeyword);
  });


  const addForm = document.getElementById('add-user-form1');

  //   EDIT
  function editRow1(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;
  
    try {
      const accessToken = getAccessTokenFromLocalStorage(); 
  
      fetch(`${API_PROTOCOL}://${API_HOSTNAME}/things-to-avoid/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, 
        },
      })
        .then(response => {
          if (response.status === 401) {
            // Unauthorized, handle this case appropriately
            console.error('Unauthorized: You may need to refresh the access token.');
          } else if (response.ok) {
            return response.json();
          } else {
            throw new Error('Fetch request failed');
          }
        })
        .then(user => {
          editForm1.elements.id.value = user.id;
          editForm1.elements.title.value = user.title;
          editForm1.elements.description.value = user.description;
  
          const existingImageURL = user.images;
          const imagePreview = document.getElementById('edit-image-preview');
          imagePreview.src = existingImageURL;
  
          editForm1.elements.existingImage.value = existingImageURL;
  
          editModal1.show();
        })
        .catch(error => console.error('Error fetching user data:', error));
    } catch (error) {
      console.error('Error during editRow1:', error);
    }
  }
  

 // Handle edit form submission
editForm1.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(editForm1);
  const updatedUser = {};
  formData.forEach((value, key) => {
    updatedUser[key] = value;
  });

  const imageInput = editForm1.querySelector('input[type="file"]');
  const imageFile = imageInput.files[0];

  if (!imageFile) {
    // No new image selected, preserve the existing image URLs as an array
    updatedUser.images = [editForm1.elements.existingImage.value];
    sendEditRequest(updatedUser);
  } else {
    var formData2 = new FormData();
    formData2.append('photo', imageFile);

    const accessToken = getAccessTokenFromLocalStorage();

    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
      method: 'POST',
      body: formData2,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then(handleErrors)
      .then(data => {
        console.log('Uploaded image URL:', data.http_img_url);

        // Put the new image URL in an array
        updatedUser.images = [data.http_img_url];
        sendEditRequest(updatedUser);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }
});

// Function to send the PUT request to update user data
function sendEditRequest(updatedUser) {
  try {
    const accessToken = getAccessTokenFromLocalStorage();

    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/things-to-avoid/${updatedUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updatedUser),
    })
      .then(response => {
        if (response.status === 401) {
          console.error('Unauthorized: You may need to refresh the access token.');
        } else if (response.ok) {
          return response.json();
        } else {
          console.error('Update request failed with status:', response.status);
          return response.text().then(text => {
            console.error('Update request error response:' + text);
            throw new Error('Update request failed.');
          });
        }
      })
      .then(data => {
        console.log('User response:', data); // Log the user response here
        editForm1.reset();
        editModal1.hide();
        populateTable();
      })
      .catch(error => {
        console.error('Error updating item data:', error);
      });
  } catch (error) {
    console.error('Error during form submission:', error);
  }
}



  // ADD
  addButton1.addEventListener('click', () => {
    addEventModal1.show();
  });

// Handle form submission and add new item
addAccountButton1.addEventListener('click', async () => {
  const form = document.getElementById('add-user-form1');
  const formData = new FormData(form);
  const imageInput = form.querySelector('#images');
  const imageFile = imageInput.files[0];

  try {
    const accessToken = getAccessTokenFromLocalStorage();
    
    // Check if an image file is selected
    if (imageFile) {
      const formDataWithImage = new FormData();
      formDataWithImage.append('photo', imageFile);

      // Upload the image
      const imageResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
        method: 'POST',
        body: formDataWithImage,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!imageResponse.ok) {
        const imageErrorData = await imageResponse.text();
        console.error('Image upload failed:', imageResponse.status, imageResponse.statusText, imageErrorData);
        return; // Exit if image upload fails
      }

      const imageData = await imageResponse.json();
      console.log('Uploaded image URL:', imageData.http_img_url);

      // Add the image URL to the user data as an array
      const user = {
        ...Object.fromEntries(formData.entries()),
        images: [imageData.http_img_url], // Keep it as an array
      };

      // Send user data to the server
      const addUserResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/things-to-avoid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(user),
      });

      if (addUserResponse.ok) {
        form.reset();
        // Use location.reload() without "this."
        location.reload();
        populateTable();
      } else {
        const addUserErrorData = await addUserResponse.text();
        console.error('Error adding item:', addUserResponse.status, addUserResponse.statusText, addUserErrorData);
      }
    }
  } catch (error) {
    console.error('Error during form submission:', error);
  }
});

 // Handle delete button
async function deleteRow(event) {
  const button = event.target;
  const row = button.closest('tr');
  const userId = row.querySelector('td:first-child').textContent;

  try {
    const accessToken = getAccessTokenFromLocalStorage();
    const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/things-to-avoid/${userId}`, {
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
