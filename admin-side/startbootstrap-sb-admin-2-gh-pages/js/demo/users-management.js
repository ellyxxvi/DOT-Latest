//modal for add user
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addModal").modal("show");
  });
});

// USER MANAGEMENT DATA
document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('tableBody');
  const addButton = document.getElementById('addButton');
  const addModal = new bootstrap.Modal(document.getElementById('addModal'));
  const addAccountButton = document.getElementById('btn-add-account');
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editForm = document.getElementById('edit-user-form');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');

  // Initial population of the table with all data
  populateTable();

  // Function to handle errors
  function handleErrors(response) {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return response.json();
  }

  function populateTable(searchKeyword = '') {
    const accessToken = getAccessTokenFromLocalStorage();
    let searchUrl = 'http://localhost:3000/users';

    fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then(handleErrors)
      .then(data => {
        const filteredData = data.filter(user => {
          return (
            user.first_name.includes(searchKeyword) ||
            user.last_name.includes(searchKeyword) ||
            user.gender.includes(searchKeyword) ||
            user.email.includes(searchKeyword) ||
            user.from_country.includes(searchKeyword) ||
            user.current_province.includes(searchKeyword) ||
            user.current_city.includes(searchKeyword) ||
            user.current_baranggay.includes(searchKeyword)
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
          filteredData.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${user.id}</td>
              <td><img src=${user.image} alt=""
                class="img-thumbnail" width="100px"></td>
              <td>${user.first_name}</td>
              <td>${user.last_name}</td>
              <td>${user.gender}</td>
              <td>${user.email}</td>
              <td>${maskPassword(user.password)}</td>
              <td>${user.from_country}</td>
              <td>${user.current_province}</td>
              <td>${user.current_city}</td>
              <td>${user.current_baranggay}</td>
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
        console.error('Error fetching data:', error);
      });
  }

  searchButton.addEventListener('click', () => {
    const searchKeyword = searchInput.value.trim();
    populateTable(searchKeyword);
  });

  function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token');
    return accessToken;
  }

  function editRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;
  
    // Fetch user data including the current image URL
    fetch(`http://localhost:3000/users/${userId}`)
      .then(handleErrors)
      .then(user => {
        const date = new Date();
        let currentDay = String(date.getDate()).padStart(2, '0');
        let currentMonth = String(date.getMonth() + 1).padStart(2, '0');
        let currentYear = date.getFullYear();
        let updated_at = `${currentDay}-${currentMonth}-${currentYear}`;
  
        editForm.elements.id.value = user.id;
        editForm.elements.first_name.value = user.first_name;
        editForm.elements.last_name.value = user.last_name;
        editForm.elements.gender.value = user.gender;
        editForm.elements.email.value = user.email;
        editForm.elements.password.value = user.password;
        editForm.elements.from_country.value = user.from_country;
        editForm.elements.current_province.value = user.current_province;
        editForm.elements.current_city.value = user.current_city;
        editForm.elements.current_baranggay.value = user.current_baranggay;
        editForm.elements.created_at.value = user.created_at;
        editForm.elements.updated_at.value = updated_at;
  
        // Display the existing image URL
        const existingImageURL = user.image; // Get the current image URL from the fetched data
        const imagePreview = document.getElementById('edit-image-preview');
        imagePreview.src = existingImageURL;
  
        editModal.show();
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }
  
  // Handle edit form submission
  editForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(editForm);
    const updatedUser = {};
    formData.forEach((value, key) => {
      updatedUser[key] = value;
    });
  
    const imageInput = editForm.querySelector('input[type="file"]');
    const imageFile = imageInput.files[0];
  
    if (imageFile) {
      var formData2 = new FormData();
      formData2.append('image', imageFile);
  
      fetch('http://localhost:3001/images', {
        method: 'POST',
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
    } else {
      // No new image selected, keep the existing image URL
      updatedUser.image = editForm.elements.existingImage.value;
      sendEditRequest(updatedUser);
    }
  });
  
  // Function to send the PUT request to update user data
  function sendEditRequest(updatedUser) {
    fetch(`http://localhost:3000/users/${updatedUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedUser)
    })
      .then(handleErrors)
      .then(data => {
        editForm.reset();
        editModal.hide();
        populateTable();
      })
      .catch(error => {
        console.error('Error updating item data:', error);
      });
  }
  
  addButton.addEventListener('click', () => {
    addModal.show();
  });
  
  addAccountButton.addEventListener('click', () => {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);
    const imageInput = form.querySelector('input[type="file"]');
    const imageFile = imageInput.files[0];
    if (imageFile) {
      formData.delete('image');
      formData.append('image', imageFile);
    }
  
    var formData2 = new FormData();
    formData2.append('image', imageFile);
  
    fetch('http://localhost:3001/images', {
      method: 'POST',
      body: formData2
    })
      .then(handleErrors)
      .then(data => {
        console.log('Uploaded image URL:', data.url);
        const imageDataUrl = data.url;
  
        const date = new Date();
        let currentDay = String(date.getDate()).padStart(2, '0');
        let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
        let currentYear = date.getFullYear();
        let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;
  
        // Include the image data URL in the user object
        const user = {
          ...Object.fromEntries(formData.entries()),
          image: imageDataUrl,
          created_at: currentDate
        };
  
        // Send POST request to JSON server
        fetch('http://localhost:3000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user)
        })
          .then(handleErrors)
          .then(data => {
            form.reset();
            populateTable();
          })
          .catch(error => {
            console.error('Error adding user:', error);
          });
      });
  });
  
  // handle delete button
  function deleteRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;
  
    fetch(`http://localhost:3000/users/${userId}`, {
      method: 'DELETE'
    })
      .then(handleErrors)
      .then(() => {
        row.remove();
      })
      .catch(error => {
        console.error('Error deleting user:', error);
      });
  }
  
  // Function to mask password
  function maskPassword(password) {
    return '*'.repeat(password.length);
  }
});
