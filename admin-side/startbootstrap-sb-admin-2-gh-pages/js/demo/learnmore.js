 // modal for add event
  $(document).ready(function () {
    $("#addButton").click(function () {
      $("#addEventModal").modal("show");
    });
  });
  
  
  document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('tableBody');
    const addButton = document.getElementById('addButton');
    const addAccountButton = document.getElementById('btn-add-account');
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const editForm = document.getElementById('edit-user-form'); 
    // Function to handle errors
    function handleErrors(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    }
  
    // Fetch data from JSON server and populate the table
    function populateTable() {
      fetch('http://localhost:3000/learnmore') // Replace with your JSON server URL
        .then(response => response.json())
        .then(data => {
          tableBody.innerHTML = ''; // Clear existing table data
          data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                          <td>${user.id}</td>
                          <td><img src=${user.image} alt=""
                          class="img-thumbnail" width="100px"></td>
                          <td>${user.description}</td>
                          <td>${user.updated_at}</td>
                          <!-- ... Other cells ... -->
                          <td>
                              <button class="btn btn-primary btn-sm edit-button" data-user-id="${user.id}">
                                  <i class="fa fa-pen"></i>
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
      fetch(`http://localhost:3000/learnmore/${userId}`)
        .then(response => response.json())
        .then(user => {
          const date = new Date();
          let currentDay = String(date.getDate()).padStart(2, '0');
          let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
          let currentYear = date.getFullYear();
          let updated_at = `${currentDay}-${currentMonth}-${currentYear}`;
  
          editForm.elements.id.value = user.id;
          // editForm.elements.image.value = user.image;
          editForm.elements.description.value = user.description;
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

    const imageInput = editForm.querySelector('input[type="file"]');
    const imageFile = imageInput.files[0];

    if (!imageFile) {
      // No new image selected, preserve the existing image URL
      updatedUser.image = editForm.elements.existingImage.value;
      sendEditRequest(updatedUser);
    } else {
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
    }
  });

    // Function to send the PUT request to update user data
    function sendEditRequest(updatedUser) {
      fetch(`http://localhost:3000/learnmore/${updatedUser.id}`, {
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
  
    // Populate the table on page load
    populateTable();
  
  });  
  