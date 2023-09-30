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
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');

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

  function formatDateToMonthAndDay(isoDate) {
    const date = new Date(isoDate);
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }
  

  function populateTable(searchKeyword = '') {
    let searchUrl = `${API_PROTOCOL}://${API_HOSTNAME}/events`;
  
    fetch(searchUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const filteredData = data.filter(user => {
          return user.title.includes(searchKeyword) || 
            user.date.includes(searchKeyword) || 
            user.province.includes(searchKeyword) || 
            user.city.includes(searchKeyword) || 
            user.description.includes(searchKeyword);
        });
  
        tableBody.innerHTML = '';
  
        if (filteredData.length === 0) {
          const noResultsRow = document.createElement('tr');
          noResultsRow.innerHTML = `
            <td colspan="10" style="text-align: center;">There are no relevant search results.</td>
          `;
          tableBody.appendChild(noResultsRow);
        } else {
          // Populate the table with search results
          filteredData.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${user.id}</td>
              <td><img src=${user.images} alt=""
              class="img-thumbnail" width="100px"></td>
              <td>${user.title}</td>
              <td>${user.description}</td>
              <td>${formatDateToMonthAndDay(user.date)}</td>
              <td>${user.province}</td>
              <td>${user.city}</td>
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
  
      })
      .catch(error => {
        if (error instanceof SyntaxError) {
          console.error('Response is not valid JSON. It might be an HTML error page.');
        } else {
          console.error('Error fetching data:', error);
        }
        // Handle the error gracefully, e.g., display an error message on your webpage.
      });
  }
  
  populateTable();

  searchButton.addEventListener('click', () => {
    const searchKeyword = searchInput.value.trim();
    console.log('Search keyword:', searchKeyword);
    populateTable(searchKeyword);
  });

  // handles image uploads
  const addForm = document.getElementById('add-user-form');

  function editRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const id = row.querySelector('td:first-child').textContent;
  
    // Get the access token from local storage
    const accessToken = getAccessTokenFromLocalStorage();
  
    // Log the ID for debugging purposes
    console.log("ID: " + JSON.stringify(id));
  
    // Make a fetch request to get the event details
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then(response => {
        if (response.status === 401) {
          console.error('Unauthorized: You may need to refresh the access token.');
          return null; 
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error('Fetch request failed');
        }
      })
      .then(eventData => {
        // Log the expected input structure from the server for debugging
        console.log('Expected input structure from the server:', eventData);
  
        // Check if event data is valid
        if (!eventData) {
          console.error("No event data found.");
          return;
        }
  
        // Populate the form with event data
        editForm.elements.id.value = eventData.id;
        editForm.elements.title.value = eventData.title;
        editForm.elements.description.value = eventData.description;
        editForm.elements.province.value = eventData.province;
        editForm.elements.city.value = eventData.city;

        // Check if the date is valid and format it
        if (eventData.date && isValidISODate(eventData.date)) {
          const formattedDate = formatDateToMonthAndDay(eventData.date);
          editForm.elements.date.value = formattedDate;
        } else {
          editForm.elements.date.value = '';
        }
  
        // Populate other form fields as needed (e.g., province, city)
  
        // Display the existing image URL
        const existingImageURL = eventData.images;
        const imagePreview = document.getElementById('edit-image-preview');
        imagePreview.src = existingImageURL;
  
        // Store the existing image URL in a hidden input field
        editForm.elements.existingImage.value = existingImageURL;
  
        // Show the edit modal
        editModal.show();
      })
      .catch(error => {
        console.error('Error fetching event data:', error);
      });
  }
  
  // Function to check if a date string is a valid ISO date
  function isValidISODate(dateString) {
    return dateString && !isNaN(Date.parse(dateString));
  }
  
  // Rest of your code for form submission and update requests
  
  
  
// Handle edit form submission
editForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(editForm);
  const updatedUser = {};
  formData.delete('created_at'); // remove created_at
  formData.delete('existingImage'); // remove existingImage
  formData.append("barangay", "Unknown Barangay");
  formData.delete('updated_at');
  formData.forEach((value, key) => {
    if (key === 'date') {
      // Convert the date to ISO string format
      const date = new Date(value);
      updatedUser[key] = date.toISOString();
    } else {
      updatedUser[key] = value;
    }
  });

  const imageInput = editForm.querySelector('input[type="file"]');
  const imageFile = imageInput.files[0];
  const accessToken = getAccessTokenFromLocalStorage();

  if (!imageFile) {
    // No new image selected, preserve the existing image URL
    updatedUser.images = [editForm.elements.existingImage.value];
    console.log("EDIT1 " + JSON.stringify(updatedUser));
    sendEditRequest(updatedUser, accessToken);
  } else {
    var formData2 = new FormData();
    formData2.append('photo', imageFile);

    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
      method: 'POST',
      body: formData2,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Image upload failed');
        }
      })
      .then(data => {
        console.log('Uploaded image URL:', data.http_img_url);

        updatedUser.images = [data.http_img_url];
        console.log("EDIT2 "+ JSON.stringify(updatedUser));
        sendEditRequest(updatedUser, accessToken);
      })
      .catch(error => {
        console.error('There was a problem with the image upload:', error);

      });
  }
});

// Function to send the PUT request to update user data
function sendEditRequest(updatedUser, accessToken) {
  var userId = updatedUser.id;
  delete updatedUser.id;
  fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updatedUser)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Update request failed');
      }
    })
    .then(data => {
      editForm.reset();
      editModal.hide();
      populateTable();
    })
    .catch(error => {
      console.error('Error updating item data:', error);
    });
}

  // Handle form submission and add new item
  addButton.addEventListener('click', () => {
    addEventModal.show();
  });


// Handle form submission and add new item
addAccountButton.addEventListener('click', () => {
  const form = document.getElementById('add-user-form');
  const formData = new FormData(form);
  const imageInput = form.querySelector('#images');
  const imageFile = imageInput.files[0];

  // Obtain the access token (replace with your actual method)
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

        // Convert the input date to ISO string
        const inputDate = new Date(formData.get('date'));
        const isoDateString = inputDate.toISOString();

        // Provide a value for "barangay"
        const barangay = 'Unknown Barangay';

        const user = {
          title: formData.get('title'),
          description: formData.get('description'),
          date: isoDateString, 
          province: formData.get('province'),
          city: formData.get('city'),
          images: [imageData.http_img_url],
          barangay: barangay, 
        };

        fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events`, {
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
          .catch(error => {
            console.error('Error adding user data:', error);
          });
      })
      .catch(error => {
        console.error('Image upload error:', error);
      });
  } else {
    const user = Object.fromEntries(formData.entries());

    // Convert the input date to ISO string
    const inputDate = new Date(user.date);
    const isoDateString = inputDate.toISOString();
    user.date = isoDateString; // Use the ISO date string for server

    // Provide a dummy value for "barangay"
    const barangay = 'Unknown Barangay';

    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events`, {
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
          });
        }
      })
      .then(userData => {
        console.log('User response:', userData);
        form.reset();
        location.reload();
        populateTable();
      })
      .catch(error => {
        console.error('Error adding user data:', error);
      });
  }
});



 // Handle delete button
 async function deleteRow(event) {
  const button = event.target;
  const row = button.closest('tr');
  const userId = row.querySelector('td:first-child').textContent;

  try {
    const accessToken = getAccessTokenFromLocalStorage();
    const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events/${userId}`, {
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
