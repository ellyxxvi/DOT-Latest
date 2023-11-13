//modal for add user
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addModal").modal("show");
  });
});

// const API_PROTOCOL = 'https';
// const API_HOSTNAME = 'goexplorebatangas.com/api';
const API_PROTOCOL = 'http'
const API_HOSTNAME = '13.229.101.17/api'


document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('tableBody');
  const editModal = new bootstrap.Modal(document.getElementById('editModal')); // Add this line
  const editForm = document.getElementById('edit-user-form'); // Add this line

  function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token');
    return accessToken;
  }

  // Function to include authorization headers in fetch requests
  function fetchWithAuthorization(url, options = {}) {
    // Get the access token from local storage
    const accessToken = getAccessTokenFromLocalStorage();

    // Include the authorization header if an access token is available
    if (accessToken) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Access-Control-Allow-Origin': '*'
      };
    }

    // Perform the fetch request with the modified options
    return fetch(url, options);
  }

  // Fetch data from JSON server and populate the table
  function populateTable() {
    fetchWithAuthorization(`${API_PROTOCOL}://${API_HOSTNAME}/footer`, {
      method: 'GET', // Replace with the appropriate HTTP method
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        // Log the successful response
        console.log('Fetch successful. Response data:', data);
        tableBody.innerHTML = ''; // Clear existing table data
        data.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.description}</td>
            <td>${user.created_at}</td>
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

        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => {
          button.addEventListener('click', editRow);
        });
      })
      .catch(error => {
        // Log the error response
        console.error('Error fetching data:', error);
      });
  }

  function editRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;
  
    fetchWithAuthorization(`${API_PROTOCOL}://${API_HOSTNAME}/footer/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(user => {
        console.log('Edit user successful. Response data:', user);
  
        editForm.elements.id.value = user.id;
        editForm.elements.description.value = user.description;
        editModal.show();
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        // Handle the error here, e.g., display an error message to the user
      });
  }
  

  // Handle edit form submission
  editForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(editForm);
    const updatedUser = {};
    formData.forEach((value, key) => {
      updatedUser[key] = value;
      // console.log("Data: " + JSON.stringify(updatedUser));
    });
    console.log("Data: " + JSON.stringify(updatedUser));
    // Send PUT request to update user data
    fetchWithAuthorization(`${API_PROTOCOL}://${API_HOSTNAME}/footer/${updatedUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Edit successful. Response data:'+ data);
        editForm.reset();
        editModal.hide();
        populateTable();
      })
      .catch(error => {
        console.error('Error updating user data:', error);
      });
  });

  let dataAdded = false;

  function checkDataAdded() {
    fetchWithAuthorization(`${API_PROTOCOL}://${API_HOSTNAME}/footer`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Data fetched successfully:', data);
        if (data.length > 0) {
          dataAdded = true;
          document.getElementById('btn-add-account').disabled = true;
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  checkDataAdded();

  document.getElementById('btn-add-account').addEventListener('click', function () {
    if (dataAdded) {
      alert('Data has already been added. You cannot add more data.');
      return;
    }

    const description = document.getElementById('description').value;
    const data = {
      description: description,
    };

    console.log('Data being sent:', data);

    fetchWithAuthorization(`${API_PROTOCOL}://${API_HOSTNAME}/footer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (response.ok) {
          console.log('Add user successful. Response:', response);
          alert('Data sent successfully');

          const addModal = document.getElementById('addModal');
          addModal.remove();

          window.location.reload();
          const form = document.getElementById('add-user-form');

          form.reset();

          dataAdded = true;
          document.getElementById('btn-add-account').disabled = true;
        } else {
          console.error('Error sending data. Response:', response);
          alert('Error sending data');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });

  populateTable();
});
