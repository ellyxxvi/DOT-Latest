
// modal for add event
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addEventModal").modal("show");
  });
});


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
    let searchUrl = 'http://13.229.106.142/places';

    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        const filteredData = data.filter(user => {
          return user.title.includes(searchKeyword) || user.category.includes(searchKeyword) || user.province.includes(searchKeyword) || user.city.includes(searchKeyword) || user.barangay.includes(searchKeyword) || user.contact.includes(searchKeyword) || user.website.includes(searchKeyword);
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
                        <td><img src=${user.image} alt=""
                        class="img-thumbnail" width="100px"></td>
                        <td>${user.title}</td>
                        <td>${user.description}</td>
                        <td>${user.category}</td>
                        <td>${user.province}</td>
                        <td>${user.city}</td>
                        <td>${user.barangay}</td>
                        <td>${user.contact}</td>
                        <td>${user.website}</td>
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

    fetch(`http://13.229.106.142/places/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                // Handle unauthorized access here (e.g., redirect to login)
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
        const date = new Date();
        let currentDay = String(date.getDate()).padStart(2, '0');
        let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
        let currentYear = date.getFullYear();
        let updated_at = `${currentDay}-${currentMonth}-${currentYear}`;

        editForm.elements.id.value = user.id;
        editForm.elements.title.value = user.title;
        editForm.elements.description.value = user.description;
        editForm.elements.category.value = user.category;
        editForm.elements.province.value = user.province;
        editForm.elements.city.value = user.city;
        editForm.elements.barangay.value = user.barangay;
        editForm.elements.contact.value = user.contact;
        editForm.elements.website.value = user.website;
        editForm.elements.created_at.value = user.created_at;
        editForm.elements.updated_at.value = updated_at;

        // Display the existing image URL
        const existingImageURL = user.image; // Get the current image URL from the fetched data
        const imagePreview = document.getElementById('edit-image-preview');
        imagePreview.src = existingImageURL;

        // Store the existing image URL in a hidden input field
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
  formData.forEach((value, key) => {
      updatedUser[key] = value;
  });
  const accessToken = getAccessTokenFromLocalStorage();
  const imageInput = editForm.querySelector('input[type="file"]');
  const imageFile = imageInput.files[0];

  if (!imageFile) {
      // No new image selected, preserve the existing image URL
      updatedUser.image = editForm.elements.existingImage.value;
      sendEditRequest(updatedUser);
  } else {
      var formData2 = new FormData();
      formData2.append('image', imageFile);

      // Include the access token in the headers
      fetch('http://13.229.106.142/images', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
          },
          body: formData2
      })
          .then(handleErrors)
          .then(data => {
              console.log('Uploaded image URL:', data.url);

              updatedUser.image = data.url;
              sendEditRequest(updatedUser);
          })
          .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
          });
  }
});


  // Function to send the PUT request to update user data
  function sendEditRequest(updatedUser) {
    fetch(`http://13.229.106.142/places/${updatedUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedUser)
    })
      .then(response => response.json())
      .then(data => {
        editForm.reset();
        editModal.hide();
        populateTable();
      })
      .catch(error => console.error('Error updating item data:', error));
  }


  // Handle form submission and add new item
  addButton.addEventListener('click', () => {
    addEventModal.show();
  });

  // Handle form submission and add new item
addAccountButton.addEventListener('click', () => {
  const form = document.getElementById('add-user-form');
  const formData = new FormData(form);
  const imageInput = addForm.querySelector('input[type="file"]');
  const imageFile = imageInput.files[0];
  const accessToken = getAccessTokenFromLocalStorage();

  if (imageFile) {
      formData.delete('image');
      formData.append('image', imageFile);
  }

  var formData2 = new FormData();
  formData2.append('image', imageFile);

  // Upload the image first
  fetch('http://13.229.106.142/images', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${accessToken}`,
      },
      body: formData2
  })
      .then(response => {
          if (response.ok) {
              return response.json();
          } else {
              throw new Error('Network response was not ok.');
          }
      })
      .then(data => {
          console.log('Uploaded image URL:', data.url);

          // Declare and define the currentDate variable here
          const date = new Date();
          let currentDay = String(date.getDate()).padStart(2, '0');
          let currentMonth = String(date.getMonth() + 1).padStart(2, '0');
          let currentYear = date.getFullYear();
          let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;

          // Include the image data URL in the user object
          const user = {
              ...Object.fromEntries(formData.entries()),
              image: data.url,
              created_at: currentDate
          };

          // Send POST request to create a new item with the Bearer token in the Authorization header
          fetch('http://13.229.106.142/places', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(user)
          })
              .then(response => {
                  if (response.ok) {
                      return response.json();
                  } else {
                      throw new Error('Network response was not ok.');
                  }
              })
              .then(data => {
                  form.reset();
                  this.location.reload();
                  populateTable();
              })
              .catch(error => console.error('Error adding item:', error));
      })
      .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
      });
});


// handle delete button
function deleteRow(event) {
  const button = event.target;
  const row = button.closest('tr');
  const userId = row.querySelector('td:first-child').textContent;
  const accessToken = getAccessTokenFromLocalStorage(); // Retrieve the access token

  fetch(`http://13.229.106.142/places/${userId}`, {
      method: 'DELETE',
      headers: {
          'Authorization': `Bearer ${accessToken}`,
      },
  })
      .then(response => {
          if (response.ok) {
              return response.json();
          } else {
              throw new Error('Network response was not ok.');
          }
      })
      .then(() => {
          row.remove();
      })
      .catch(error => console.error('Error deleting user:', error));
}

// Populate the table on page load
populateTable();

});  
