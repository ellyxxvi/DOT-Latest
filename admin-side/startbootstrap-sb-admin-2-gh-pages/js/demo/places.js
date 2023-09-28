
// modal for add event
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addEventModal").modal("show");
  });
});

const API_PROTOCOL = 'http'
const API_HOSTNAME = '13.229.106.142'

document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('tableBody');
  const addButton = document.getElementById('addButton');
  const addEventModal = new bootstrap.Modal(document.getElementById('addEventModal'));
  const addAccountButton = document.getElementById('btn-add-account');
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editForm = document.getElementById('edit-user-form');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  let updatedUser = {};
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
      const searchUrl = `${API_PROTOCOL}://${API_HOSTNAME}/places`;
  
      fetch(searchUrl)
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
          })
          .then(data => {
              const filteredData = data.filter(user => {
                  const lowerKeyword = searchKeyword.toLowerCase();
                  const contact = (typeof user.contact === 'string') ? user.contact : '';
                  return (
                      user.title.toLowerCase().includes(lowerKeyword) ||
                      user.category.toLowerCase().includes(lowerKeyword) ||
                      user.province.toLowerCase().includes(lowerKeyword) ||
                      user.city.toLowerCase().includes(lowerKeyword) ||
                      user.barangay.toLowerCase().includes(lowerKeyword) ||
                      contact.toLowerCase().includes(lowerKeyword) 
                  );
              });
  
              tableBody.innerHTML = '';
  
              if (filteredData.length === 0) {
                  const noResultsRow = document.createElement('tr');
                  noResultsRow.innerHTML = `
                      <td colspan="13" style="text-align: center;">There are no relevant search results.</td>
                  `;
                  tableBody.appendChild(noResultsRow);
              } else {
                  // Populate the table with search results
                  filteredData.forEach(user => {
                      const row = document.createElement('tr');
                      row.innerHTML = `
                          <td>${user.id}</td>
                          <td><img src="${user.photos}" alt="" class="img-thumbnail" width="100px"></td>
                          <td>${user.title}</td>
                          <td>${user.description}</td>
                          <td>${user.category}</td>
                          <td>${user.province}</td>
                          <td>${user.city}</td>
                          <td>${user.barangay}</td>
                          <td>${user.contact}</td>
                          <td>${user.social_links ? user.social_links.links : ''}</td>
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
          .catch(error => console.error('Error fetching data:', error));
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
    const userId = row.querySelector('td:first-child').textContent;
    const accessToken = getAccessTokenFromLocalStorage();

    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                console.error('Unauthorized access.');
            } else {
                // Handle other errors (e.g., display an error message)
                console.error('Error fetching user data:', response.status, response.statusText);
            }
            throw new Error('Network response was not ok.');
        }

        // Check the response content type
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            // Handle non-JSON response (e.g., display an error message)
            console.error('Invalid response content type:', contentType);
            throw new Error('Invalid response content type.');
        }
    })
    .then(user => {
        editForm.elements.id.value = user.id;
        editForm.elements.title.value = user.title;
        editForm.elements.description.value = user.description;
        editForm.elements.category.value = user.category;
        editForm.elements.province.value = user.province;
        editForm.elements.city.value = user.city;
        editForm.elements.barangay.value = user.barangay;
        editForm.elements.contact.value = user.contact;
        editForm.elements.social_links.value = user.social_links.links;

        const existingImageURL = user.photos; 
        const imagePreview = document.getElementById('edit-image-preview');
        imagePreview.src = existingImageURL;

        editForm.elements.existingImage.value = existingImageURL;

        editModal.show();
    })
    .catch(error => console.error('Error fetching user data:', error));
}

// Handle edit form submission
editForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(editForm);
  const updatedUser = {};
  formData.delete('created_at'); 
  formData.delete('existingImage'); 
  formData.forEach((value, key) => {
    if (key === 'contact' || key === 'social_links') {
      updatedUser[key] = value.split(',').map(item => item.trim());
    } else {
      updatedUser[key] = value;
    }
  });
  const accessToken = getAccessTokenFromLocalStorage();
  const imageInput = editForm.querySelector('input[type="file"]');
  const imageFile = imageInput.files[0];

  if (!imageFile) {

    updatedUser.photos = [editForm.elements.existingImage.value];
    sendEditRequest(updatedUser, accessToken); 
  } else {
    const formDataForImage = new FormData();
    formDataForImage.append('photo', imageFile);

    // Include the access token in the headers
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formDataForImage,
    })
      .then(handleErrors)
      .then(data => {
        console.log('Uploaded image URL:', data.http_img_url);

        updatedUser.photos = [data.http_img_url];
        
        sendEditRequest(updatedUser, accessToken);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }
});

// Function to send the PUT request to update user data
function sendEditRequest(updatedUser, accessToken) {
  fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places/${updatedUser.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}` 
    },
    body: JSON.stringify(updatedUser)
  })
    .then(response => response.json())
    .then(data => {
      // editForm.reset();
      // editModal.hide();
      populateTable();
    })
    .catch(error => {
      console.error('Error updating item data:', error);

      console.log('User Inputs:', updatedUser);
      console.log('Error Response:', error);
      throw error;
    });
}


  // Handle form submission and add new item
  addButton.addEventListener('click', () => {
    addEventModal.show();
  });

// Handle form submission and add new item
addAccountButton.addEventListener('click', async () => {
  const form = document.getElementById('add-user-form');
  const formData = new FormData(form);
  const imageInput = document.querySelector('#photos');
  const imageFile = imageInput.files[0];
  const accessToken = getAccessTokenFromLocalStorage();

  if (!imageFile) {
    console.error('Please select an image file.');
    return;
  }

  const formDataForImage = new FormData();
  formDataForImage.append('photo', imageFile);

  try {
    const imageUploadResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formDataForImage,
    });

    if (!imageUploadResponse.ok) {
      throw new Error('Image upload failed.');
    }

    const imageUploadData = await imageUploadResponse.json();
    console.log('Uploaded image URL:', imageUploadData.http_img_url);
    console.log('User Inputs:');
    console.log('Title:', formData.get('title'));
    console.log('Description:', formData.get('description'));
    console.log('Category:', formData.get('category'));
    console.log('Province:', formData.get('province'));
    console.log('City:', formData.get('city'));
    console.log('Barangay:', formData.get('barangay'));
    console.log('Contact:', formData.get('contact'));
    console.log('Social Links:', formData.get('social_links'));
    // Convert the contacts and social_links fields to arrays
    const contact = formData.get('contact').split(',').map(contact => contact.trim());
    const socialLinks = formData.get('social_links').split(',').map(social_links => social_links.trim());

    const user = {
      ...Object.fromEntries(formData.entries()),
      photos: [imageUploadData.http_img_url],
      contact: contact, 
      social_links: {
        links: socialLinks, 
      },
    };

    const addUserResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    // Log the response from the server
    console.log('Response from server:', addUserResponse.status, addUserResponse.statusText);
    const responseBody = await addUserResponse.text();
    console.log('Response body:', responseBody);

    if (addUserResponse.ok) {
      form.reset();
      // window.location.reload();
      populateTable();
    } else {
      throw new Error('Adding item failed.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
});


  // Handle delete button
  async function deleteRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;

    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places/${userId}`, {
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
