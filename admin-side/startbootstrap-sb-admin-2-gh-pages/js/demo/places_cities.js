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
    const editModal = new bootstrap.Modal(document.getElementById('editModal')); // Add this line
    const editForm = document.getElementById('edit-user-form'); // Add this line
    let updatedUser = {};
  
  
    // Fetch data from JSON server and populate the table
    function populateTable() {
      fetch('http://localhost:3000/places_cities') // Replace with your JSON server URL
        .then(response => response.json())
        .then(data => {
          tableBody.innerHTML = ''; // Clear existing table data
          data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                          <td>${user.id}</td>
                          <td><img src=${user.image} alt=""
                          class="img-thumbnail" width="100px"></td>
                          <td>${user.city}</td>
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
        .catch(error => console.error('Error fetching data:', error));
    }
  
    // handles image uploads
    const addForm = document.getElementById('add-user-form');
  
  
    
    function editRow(event) {
      const button = event.target;
      const row = button.closest('tr');
      const userId = row.querySelector('td:first-child').textContent;
      fetch(`http://localhost:3000/places_cities/${userId}`)
        .then(response => response.json())
        .then(user => {
          const date = new Date();
          let currentDay = String(date.getDate()).padStart(2, '0');
          let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
          let currentYear = date.getFullYear();
          let updated_at = `${currentDay}-${currentMonth}-${currentYear}`;
  
          editForm.elements.id.value = user.id;
          editForm.elements.city.value = user.city;
          editForm.elements.description.value = user.description;
          editForm.elements.created_at.value = user.created_at;
          editForm.elements.updated_at.value = updated_at;
  
          // Get the existing image URL from the table row
          const existingImageCell = row.querySelector('td:nth-child(2)');
          const existingImageURL = existingImageCell.querySelector('img').getAttribute('src');
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
  
      // If there's an image file, handle its upload
      const imageInput = editForm.querySelector('input[type="file"]');
      const imageFile = imageInput.files[0];
  
      if (imageFile) {
        var formData2 = new FormData();
        formData2.append('image', imageFile);
  
        fetch('http://localhost:3001/images', {
          method: 'POST',
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
  
            // Update the user's image URL only if a new image is uploaded
            updatedUser.image = data.url;
  
            // Continue with sending the PUT request to update user data
            sendEditRequest(updatedUser);
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
          });
      } else {
        // No new image file, just send the PUT request to update user data
        sendEditRequest(updatedUser);
      }
    });
  
    // Function to send the PUT request to update user data
    function sendEditRequest(updatedUser) {
      fetch(`http://localhost:3000/places_cities/${updatedUser.id}`, {
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
  
              // Send POST request to JSON server
              fetch('http://localhost:3000/places_cities', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(user)
              })
              .then(response => response.json())
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
  
      fetch(`http://localhost:3000/places_cities/${userId}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(() => {
          row.remove();
        })
        .catch(error => console.error('Error deleting user:', error));
    }
  
    // Populate the table on page load
    populateTable();
  
  });  
  