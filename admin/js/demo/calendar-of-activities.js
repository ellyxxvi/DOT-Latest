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
    
    // Add this code inside your DOMContentLoaded event listener
    const logoutButton = document.getElementById('logoutButton');

    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('access_token_super_admin');
      localStorage.removeItem('access_token_admin');
  
      // Redirect to the login page
      window.location.href = 'login.html';
    });
  
    // Check if the user has an access token
    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    if (!accessToken) {
      // Redirect to the login page
      window.location.href = 'login.html';
      return; // Stop executing further code
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

  function formatDateToMonthAndDay(isoDate) {
    const date = new Date(isoDate);
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  function populateTable(searchKeyword = '') {
    const searchUrl = `${API_PROTOCOL}://${API_HOSTNAME}/events`;

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

        // Sort data by 'created_at' in descending order
        filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        tableBody.innerHTML = '';

        if (filteredData.length === 0) {
          const noResultsRow = document.createElement('tr');
          noResultsRow.innerHTML = `
            <td colspan="10" style="text-align: center;">There are no relevant search results.</td>
          `;
          tableBody.appendChild(noResultsRow);
        } else {
          // Populate the table with sorted search results
          filteredData.forEach((user, index) => { // Note the use of index here
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${user.id}</td>
              <td>
                  <button class="img-button btn-primary btn-sm" data-index="${index}" data-toggle="modal" data-target="#imageModal" data-image-src="${user.images && user.images.length > 0 ? user.images.join(',') : ''}">
                  <i class="fa fa-image"></i>
                  </button>
              </td>
              <td>${user.title}</td>
              <td>${user.description}</td>
              <td>${formatDateToMonthAndDay(user.date)}</td>
              <td>${user.province}</td>
              <td>${user.city}</td>
              <td>${formatDateToMonthAndDay(user.created_at)}</td>
              <td>${formatDateToMonthAndDay(user.updated_at)}</td>
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
                const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events/${userId}?role=ADMIN`, {
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
          
          // After rows are added to the table, find all img-buttons and add event listeners
          const imgButtons = document.querySelectorAll(".img-button");
          imgButtons.forEach(button => {
            button.addEventListener("click", function () {
              const index = this.getAttribute("data-index"); // Retrieve index from data attribute
              const userData = filteredData[index]; // Access the user data using the index
              console.log('Data for clicked row:', userData);

              const imageSrcArray = userData.images || []; // Directly use userData.images array
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
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
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

    console.log("ID: " + JSON.stringify(id));

    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events/${id}`, {
      method: 'GET',
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
  
        // // Check if the date is valid and format it
        // if (eventData.date && isValidISODate(eventData.date)) {
        //   const formattedDate = formatDateToMonthAndDay(eventData.date);
        //   editForm.elements.date.value = formattedDate;
        // } else {
        //   editForm.elements.date.value = '';
        // }
  
        // Populate other form fields as needed (e.g., province, city)
  
        // Display existing image URLs
        const existingImages = eventData.images;
        const imagePreviewsContainer = document.getElementById('image-previews');
        
        // Clear any previous image previews
        imagePreviewsContainer.innerHTML = '';
  
        for (let i = 0; i < existingImages.length; i++) {
          const existingImageURL = existingImages[i];
          
          // Create an img element for the image preview
          const imagePreview = document.createElement('img');
          imagePreview.src = existingImageURL;
          imagePreview.classList.add('existing-image-preview');
          
          // Append the image preview to the container
          imagePreviewsContainer.appendChild(imagePreview);
        }
  
        // Show the edit modal
        editModal.show();
      })
      .catch(error => {
        console.error('Error fetching event data:', error);
      });
  }
  


  function isValidISODate(dateString) {
    return dateString && !isNaN(Date.parse(dateString));
  }

// Handle edit form submission
editForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(editForm);
  const updatedEvent = {};

  // Remove unnecessary form fields
  formData.delete('created_at');
  formData.delete('existingImage');
  formData.append("barangay", "Unknown Barangay");
  formData.delete('updated_at');

  // Retrieve the accessToken from local storage
  const accessToken = getAccessTokenFromLocalStorage();
  formData.forEach((value, key) => {
    if (value !== '[object Object]') {
      updatedEvent[key] = value;
    }
  });
  // Handle multiple image files
  const imageInputs = editForm.querySelectorAll('input[type="file"]');
  const imageFiles = [];
  const promises = [];

  // Collect all selected image files and their upload promises
  imageInputs.forEach(input => {
    const files = Array.from(input.files);
    files.forEach(file => {
      var formData2 = new FormData();
      formData2.append('photo', file);

      const uploadPromise = fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
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
        });

      promises.push(uploadPromise);
      imageFiles.push(uploadPromise);
    });
  });

  Promise.all(promises)
    .then(imageDataArray => {
      updatedEvent.images = imageDataArray.map(data => data.http_img_url);

      updatedEvent.id = editForm.elements.id.value;
      console.log(updatedEvent);
      sendEditRequest(updatedEvent, accessToken);
    })
    .catch(error => {
      console.error('There was a problem with image uploads:', error);
    });
});

function sendEditRequest(updatedEvent, accessToken) {
  const eventId = updatedEvent.id;
  delete updatedEvent.id;

  
  // Log the data before sending the request
  console.log('Data sent to server for edit:', updatedEvent);

  fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events/${eventId}`, {
    method: 'GET',
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
    .then(existingEventData => {
      if (!existingEventData) {
        console.error("No existing event data found.");
        return;
      }

      if (existingEventData.images && existingEventData.images.length > 0) {
        updatedEvent.images = [...existingEventData.images, ...updatedEvent.images];
      }

      // console.log('Updated Event Data with Preserved Images:', updatedEvent);

      return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedEvent),
      });
    })
    .then(response => {
      if (response && response.ok) {
        return response.json();
      } else {
        throw new Error('Update request failed');
      }
    })
    .then(data => {
      console.log('Update successful:', data);
      editForm.reset();
      editModal.hide();
      populateTable();
    })
    .catch(error => {
      console.error('Error updating event data:', error);
    });
}

  const imageInput = document.getElementById('images');

  // Image preview functionality
  imageInput.addEventListener('change', function(event) {
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    imagePreviewContainer.innerHTML = ''; // Clear existing previews

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

  // Handle form submission and add new item
  addButton.addEventListener('click', () => {
    addEventModal.show();
  });

addAccountButton.addEventListener('click', () => {
        const form = document.getElementById('add-user-form');
        const formData = new FormData(form);
        const imageInput = form.querySelector('#images');
        const images = imageInput.files;

        // Obtain the access token
        const accessToken = getAccessTokenFromLocalStorage();

        if (!accessToken) {
            console.error('Access token not found.');
            return;
        }

        if (images.length === 0) {
          alert('Please select at least one image.');
            return;
        }

        if (images.length > 5) {
            console.error('You can upload a maximum of 5 images.');
            return;
        }

        const imageUploadPromises = Array.from(images).map(imageFile => {
            const imageFormData = new FormData();
            imageFormData.append('photo', imageFile);

            return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
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
                return imageData.http_img_url;
            });
        });

        Promise.all(imageUploadPromises)
        .then(imageUrls => {
            const inputDate = new Date(formData.get('date'));
            const isoDateString = inputDate.toISOString();

            const barangay = 'Unknown Barangay'; // Placeholder value

            const user = {
                title: formData.get('title'),
                description: formData.get('description'),
                date: isoDateString,
                province: formData.get('province'),
                city: formData.get('city'),
                images: imageUrls,
                barangay: barangay,
            };

            return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(user),
            });
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
            window.location.reload();
            populateTable();
        })
        .catch(error => {
            console.error('Error adding user data:', error);
        });
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

