
// modal for add event
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addEventModal").modal("show");
  });
});

const API_PROTOCOL = 'https'
const API_HOSTNAME = 'goexplorebatangas.com/api'

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
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const filteredData = data.filter((user) => {
          const lowerKeyword = searchKeyword.toLowerCase();
          const contact = typeof user.contact === 'string' ? user.contact : '';
          return (
            user.title.toLowerCase().includes(lowerKeyword) ||
            user.category.toLowerCase().includes(lowerKeyword) ||
            user.province.toLowerCase().includes(lowerKeyword) ||
            user.city.toLowerCase().includes(lowerKeyword) ||
            user.barangay.toLowerCase().includes(lowerKeyword) ||
            contact.toLowerCase().includes(lowerKeyword)
          );
        });
  
        // Sort data by 'created_at' in descending order
        filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
        tableBody.innerHTML = '';
  
        if (filteredData.length === 0) {
          const noResultsRow = document.createElement('tr');
          noResultsRow.innerHTML = `
              <td colspan="13" style="text-align: center;">There are no relevant search results.</td>
            `;
          tableBody.appendChild(noResultsRow);
        } else {
          // Populate the table with sorted search results
          filteredData.forEach((user) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td><img src="${user.photos[0]}" alt="" class="img-thumbnail" width="100px"></td>
                <td>${user.title}</td>
                <td>${user.description}</td>
                <td>${user.category}</td>
                <td>${user.province}</td>
                <td>${user.city}</td>
                <td>${user.barangay}</td>
                <td>${user.contact}</td>
                <td>
                  <ul>
                    <li>Facebook: <a href="${user.social_links ? user.social_links.fb : ''}" target="_blank">${
              user.social_links ? user.social_links.fb : ''
            }</a></li>
                    <li>Website: <a href="${user.social_links ? user.social_links.website : ''}" target="_blank">${
              user.social_links ? user.social_links.website : ''
            }</a></li>
                  </ul>
                </td>
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
        deleteButtons.forEach((button) => {
          button.addEventListener('click', deleteRow);
        });
  
        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach((button) => {
          button.addEventListener('click', editRow);
        });
      })
      .catch((error) => console.error('Error fetching data:', error));
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

        // Adapt social_links to match your form structure
        editForm.elements.fb_link.value = user.social_links.fb;
        editForm.elements.website_link.value = user.social_links.website;

        // Loop through user photos to update each image preview
        for (let i = 0; i < user.photos.length; i++) {
            const existingImageURL = user.photos[i];
            const imagePreview = document.getElementById(`edit-image-preview-${i + 1}`);
            imagePreview.src = existingImageURL;
        }

        editModal.show();
    })

      .catch(error => console.error('Error fetching user data:', error));
  }

// Handle edit form submission
editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(editForm);
  const updatedUser = {};
  formData.delete('created_at');
  formData.delete('existingImage');

  updatedUser.contact = formData.get('contact').split(',').map((contact) => contact.trim());

  updatedUser.social_links = {
    fb: formData.get('fb_link').trim(),
    website: formData.get('website_link').trim(),
  };

  formData.delete('contact');
  formData.delete('fb_link');
  formData.delete('website_link');

  formData.forEach((value, key) => {
    if (value !== '[object Object]') {
      updatedUser[key] = value;
    }
  });

  const accessToken = getAccessTokenFromLocalStorage();

  const imageInput = editForm.querySelector('input[type="file"]');
  const imageFiles = imageInput.files;

  try {
    const uploadedImageUrls = [];

    for (const imageFile of imageFiles) {
      const formDataForImage = new FormData();
      formDataForImage.append('photo', imageFile);

      const imageUploadResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formDataForImage,
      });

      if (!imageUploadResponse.ok) {
        throw new Error('Image upload failed.');
      }

      const imageUploadData = await imageUploadResponse.json();
      console.log('Uploaded image URL:', imageUploadData.http_img_url);
      uploadedImageUrls.push(imageUploadData.http_img_url);
    }

    updatedUser.photos = Array.isArray(updatedUser.photos)
      ? updatedUser.photos.filter((photo) => typeof photo === 'string')
      : [];

    if (uploadedImageUrls.length > 0) {
      updatedUser.photos.push(...uploadedImageUrls);
    }

    sendEditRequest(updatedUser, accessToken);
  } catch (error) {
    console.error('There was a problem with image uploads:', error);
  }
});


// Function to send the PUT request to update user data
async function sendEditRequest(updatedUser, accessToken) {
  console.log('EDIT: ' + JSON.stringify(updatedUser));
  try {
    if (!updatedUser.photos) {
      updatedUser.photos = [editForm.elements.existingImage.value];
    }

    if (!updatedUser.id) {
      console.error('Error updating item data: Invalid ID');
      return;
    }

    console.log('Sending PUT request with updatedUser:', updatedUser);

    const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places/${updatedUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updatedUser),
    });

    if (!response.ok) {
      throw new Error(`Error updating item data: ${response.status} - ${response.statusText}`);
    }

    if (response.status === 201) {
      // Success: handle the update
      editForm.reset();
      editModal.hide();
      populateTable();
    } else {
      console.error('Error updating item data:', response.status);
    }
  } catch (error) {
    console.error('Error updating item data:', error);
    console.log('User Inputs:', updatedUser);
  }
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
  const images = imageInput.files; // Get an array of selected image files
  const accessToken = getAccessTokenFromLocalStorage();

  if (images.length !== 5) { // Check for exactly 5 images
    alert('Please select exactly 5 image files.');
    console.error('Please select exactly 5 image files.');
    return;
  }

  const uploadedImageUrls = [];

  try {
    for (const imageFile of images) {
      const formDataForImage = new FormData();
      formDataForImage.append('photo', imageFile);

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
      uploadedImageUrls.push(imageUploadData.http_img_url);
    }

    // Convert the contacts field to an array
    const contact = formData.get('contact').split(',').map(contact => contact.trim());

    // Create an object for social_links
    const socialLinks = {
      fb: formData.get('fb_link').trim(),
      website: formData.get('website_link').trim()
    };

    const user = {
      ...Object.fromEntries(formData.entries()),
      photos: uploadedImageUrls, // Use the array of image URLs
      contact: contact,
      social_links: socialLinks,
    };

    // Remove the "fb_link" and "website_link" properties from the user object
    delete user.fb_link;
    delete user.website_link;

    // Log user inputs
    console.log('User Inputs:', user);

    const addUserResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    // Log the data sent to the server
    console.log('Data Sent to Server:', JSON.stringify(user));

    // Log the response from the server
    console.log('Response from server:', addUserResponse.status, addUserResponse.statusText);
    const responseBody = await addUserResponse.text();
    console.log('Response body:', responseBody);

    if (addUserResponse.ok) {
      form.reset();
      window.location.reload();
      populateTable();
    } else {
      alert('Please enter some data or choose "None" if applicable.');
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
