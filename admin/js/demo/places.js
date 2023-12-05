
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
  const addEventModal = new bootstrap.Modal(document.getElementById('addEventModal'));
  const addAccountButton = document.getElementById('btn-add-account');
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editForm = document.getElementById('edit-user-form');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  let updatedUser = {};
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
      throw new Error('Network response was not ok.');
    }
    return response.json();
  }

  function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
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
          filteredData.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>
                  <button class="img-button btn-primary btn-sm" data-index="${index}" data-toggle="modal" data-target="#imageModal" data-image-src="${user.photos && user.photos.length > 0 ? user.photos.join(',') : ''}">
                  <i class="fa fa-image"></i>
                  </button>
                </td>
                <td>${user.title}</td>
                <td>${user.description}</td>
                <td>${user.category}</td>
                <td>${user.province}</td>
                <td>${user.city}</td>
                <td>${user.barangay}</td>
                <td>${user.contact}</td>
                <td>
                  <ul>
                    <li>Facebook: <a href="${user.social_links ? user.social_links.fb : ''}" target="_blank">${user.social_links ? user.social_links.fb : ''
              }</a></li>
                    <li>Website: <a href="${user.social_links ? user.social_links.website : ''}" target="_blank">${user.social_links ? user.social_links.website : ''
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
              const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places/${userId}?role=ADMIN`, {
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
        editButtons.forEach((button) => {
          button.addEventListener('click', editRow);
        });
        // After rows are added to the table, find all img-buttons and add event listeners
        const imgButtons = document.querySelectorAll(".img-button");
        imgButtons.forEach(button => {
          button.addEventListener("click", function () {
            const index = this.getAttribute("data-index"); // Retrieve index from data attribute
            const userData = filteredData[index]; // Access the user data using the index
            console.log('Data for clicked row:', userData);

            const imageSrcArray = userData.photos || []; // Directly use userData.images array
            const imageGallery = document.getElementById("imageGallery");

            // Clear previous images
            imageGallery.innerHTML = '';

            // Check if there are images and create an img element for each one
            if (imageSrcArray.length > 0) {
              imageSrcArray.forEach(imageSrc => {
                const imgElement = document.createElement('img');
                imgElement.src = imageSrc;

                // Set a fixed size for the image
                imgElement.style.width = "120px";
                imgElement.style.height = "120px";
                imgElement.style.objectFit = "cover";
                imgElement.style.margin = "10px";
                imageGallery.style.justifyContent = 'center';
                imageGallery.style.alignItems = 'center';

                imgElement.alt = "Festival Image";
                imgElement.classList.add("img-fluid");
                imageGallery.appendChild(imgElement);
              });
            } else {
              // If no images, display a placeholder or message
              imageGallery.innerHTML = `<p>No images available.</p>`;
            }
          });
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
  
    // Check if the form and elements exist before accessing them
    if (!editForm) {
      console.error('editForm not found.');
      return;
    }
  
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
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
        // Check if the form and elements exist before accessing them
        if (!editForm.elements) {
          console.error('Form elements not found.');
          return;
        }
  
        // Update form elements with user data
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
  
        // Display existing images
        const existingImages = user.photos; // Replace with the correct property name for existing images
        const imagePreviewsContainer = document.getElementById('image-previews');
        
        imagePreviewsContainer.innerHTML = '';
    
        for (let i = 0; i < existingImages.length; i++) {
          const existingImageURL = existingImages[i];
    
          const imagePreview = document.createElement('img');
          imagePreview.src = existingImageURL;
          imagePreview.classList.add('existing-image-preview');
    
          imagePreviewsContainer.appendChild(imagePreview);
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

    // Log the edited user data
    console.log('Edited User Data:', updatedUser);

    // Define accessToken - replace this with your actual access token retrieval logic
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

      // Preserve existing image URLs in updatedUser.photos
      const existingImages = formData.getAll('existingImage');
      updatedUser.photos = existingImages;

      if (uploadedImageUrls.length > 0) {
        updatedUser.photos.push(...uploadedImageUrls);
      }

      // Update the user ID
      updatedUser.id = formData.get('id'); 

      sendEditRequest(updatedUser, accessToken);
    } catch (error) {
      console.error('There was a problem with image uploads:', error);
    }
  });

async function sendEditRequest(updatedUser, accessToken) {
  console.log('EDIT: ' + JSON.stringify(updatedUser));
  try {
    if (!updatedUser.id) {
      console.error('Error updating item data: Invalid ID');
      return;
    }

    console.log('Sending PUT request with updatedUser:', updatedUser);

    const existingUserData = await fetchExistingUserData(updatedUser.id, accessToken);

    if (existingUserData) {
      if (existingUserData.photos && existingUserData.photos.length > 0) {
        updatedUser.photos = [
          ...existingUserData.photos,
          ...updatedUser.photos,
        ];
      }
    } else {
      console.error('Error fetching existing user data.');
      return;
    }

    const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places/${updatedUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updatedUser),
    });

    if (!response.ok) {
      console.error('Error updating item data:', response.status);
      return;
    }

    if (response.status === 201) {
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

async function fetchExistingUserData(userId, accessToken) {
  try {
    const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      console.error('Unauthorized: You may need to refresh the access token.');
      return null;
    } else if (!response.ok) {
      console.error('Error fetching user data:', response.status, response.statusText);
      return null;
    }

    const existingUserData = await response.json();
    return existingUserData;
  } catch (error) {
    console.error('Error fetching existing user data:', error);
    return null;
  }
}


  const imageInput = document.getElementById('photos');

  imageInput.addEventListener('change', function(event) {
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    imagePreviewContainer.innerHTML = ''; 

    const files = event.target.files;
    for (const file of files) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.marginRight = '10px';
      img.onload = function() {
        URL.revokeObjectURL(img.src);
      };

      imagePreviewContainer.appendChild(img);
    }
  });


  addButton.addEventListener('click', () => {
    addEventModal.show();
  });

addAccountButton.addEventListener('click', async () => {
  const form = document.getElementById('add-user-form');
  const formData = new FormData(form);
  const imageInput = document.querySelector('#photos');
  const images = imageInput.files; 
  const accessToken = getAccessTokenFromLocalStorage();

  if (images.length > 5) { 
    alert('Please select no more than 5 image files.');
    console.error('Please select no more than 5 image files.');
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


    const contact = formData.get('contact').split(',').map(contact => contact.trim());


    const socialLinks = {
      fb: formData.get('fb_link').trim(),
      website: formData.get('website_link').trim()
    };

    const user = {
      ...Object.fromEntries(formData.entries()),
      photos: uploadedImageUrls, 
      contact: contact,
      social_links: socialLinks,
    };

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

    console.log('Data Sent to Server:', JSON.stringify(user));


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

