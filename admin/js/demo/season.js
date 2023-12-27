
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
  const addPlaceModal = new bootstrap.Modal(document.getElementById('addPlaceModal'));
  const addPlaceButton = document.getElementById('addPlaceToSeason');
  const placesTableBody = document.getElementById('placesTableBody');
  const seasonSelect = document.getElementById('seasonSelect');
  const addPlaceButtonInModal = document.getElementById('addPlaceButton');
  const loadMoreButton = document.getElementById('loadMoreButton');
  
  let placesData = [];
  let displayedPlaces = 10; // Number of places initially displayed
  let seasonsData = []; // Updated to fetch data dynamically
  
  addPlaceButton.addEventListener('click', () => {
      console.log('Add Place button clicked');
      fetchPlacesData(); // Fetch places data before showing the modal
      fetchSeasonsData(); // Fetch seasons data
  });
  
  addPlaceButtonInModal.addEventListener('click', () => {
    const selectedPlaces = Array.from(document.querySelectorAll('input[name="place"]:checked'))
      .map(input => input.value);
  
    if (selectedPlaces.length === 0) {
      // Handle case where no places are selected
      console.log('No places selected. Please select at least one place.');
      return;
    }
  
    const selectedSeasonId = String(seasonSelect.value);
  
    console.log('Selected Places:', selectedPlaces);
    console.log('Selected Season ID:', selectedSeasonId);
  
    addPlacesToSeason(selectedSeasonId, selectedPlaces);
  });
  
  
  

  
  loadMoreButton.addEventListener('click', () => {
      displayedPlaces += 10; // Increase the number of displayed places by 10
      populatePlacesTable();
  });
  
  function populatePlacesTable() {
      placesTableBody.innerHTML = '';
      const placesToDisplay = placesData.slice(0, displayedPlaces);
      placesToDisplay.forEach(place => {
          const row = document.createElement('tr');
          row.innerHTML = `
              
              <td>${place.title}</td>
              <td><input type="checkbox" name="place" value="${place.id}"></td>
          `;
          placesTableBody.appendChild(row);
      });
  
      if (displayedPlaces < placesData.length) {
          // If there are more places to display, show the "Load More" button
          const loadMoreRow = document.createElement('tr');
          const loadMoreCell = document.createElement('td');
          loadMoreCell.colSpan = 3; // Span across all columns
          loadMoreRow.appendChild(loadMoreCell);
          placesTableBody.appendChild(loadMoreRow);
      } else {
          // No more places to display, remove the "Load More" button
          loadMoreButton.remove();
      }
  }
  
  function populateSeasonsSelect() {
      seasonSelect.innerHTML = '';
      seasonsData.forEach(season => {
          const option = document.createElement('option');
          option.value = season.id;
          option.text = season.name;
          seasonSelect.appendChild(option);
      });
  }
  
  async function fetchPlacesData() {
    try {
        const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
         // Log all data received from the API
         console.log('All Places Data:', data);
        placesData = data;
        populatePlacesTable();
        console.log('Before show modal');
        addPlaceModal.show();
        console.log('After show modal');
    } catch (error) {
        console.error('Error fetching places data:', error);
    }
}

async function fetchSeasonsData() {
    try {
        console.log('Fetching seasons data...');
        const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/seasons`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        seasonsData = await response.json();
        console.log('Seasons data:', seasonsData);
        populateSeasonsSelect();
    } catch (error) {
        console.error('Error fetching seasons data:', error);
    }
}

async function addPlacesToSeason(seasonId, placeIds) {
  try {
    const accessToken = getAccessTokenFromLocalStorage();

    console.log('Adding places to season...');

    for (const placeId of placeIds) {
      const url = `${API_PROTOCOL}://${API_HOSTNAME}/seasons/place/${placeId}`;
      console.log('Request URL:', url);
      console.log('Request Payload:', JSON.stringify({ season_id: seasonId, place_ids: [placeId] }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ season_id: seasonId, place_ids: [placeId] }),
      });

      if (!response.ok) {
        console.error('Server Response:', await response.text());
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response from server:', result);
    }

    // Optionally, you can reload the window after all places are added
    window.location.reload();

  } catch (error) {
    console.error('Error adding places to season:', error);
  }
}



  
  
  

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
  // Function to format date string to "Month Day" format
  function formatDate(dateString) {
    const options = { month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  function populateTable(searchKeyword = '') {
    const searchUrl = `${API_PROTOCOL}://${API_HOSTNAME}/seasons`;

    fetch(searchUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const formattedData = data.map(user => ({
          ...user,
          from_date: formatDate(user.from_date),
          to_date: formatDate(user.to_date)
        }));

        const filteredData = formattedData.filter((user) => {
          const lowerKeyword = searchKeyword.toLowerCase();
          const contact = typeof user.contact === 'string' ? user.contact : '';
          return (
            user.name.toLowerCase().includes(lowerKeyword) ||
            user.description.toLowerCase().includes(lowerKeyword) ||
            user.from_date.toLowerCase().includes(lowerKeyword) ||
            user.to_date.toLowerCase().includes(lowerKeyword) ||
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
                          <td>${user.name}</td>
                          <td>${user.description}</td>
                          <td>${user.from_date}</td>
                          <td>${user.to_date}</td>
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
              const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/seasons/${userId}?role=ADMIN`, {
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
        const imgButtons = document.querySelectorAll(".img-button");
        imgButtons.forEach(button => {
          button.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            const userData = filteredData[index];
            console.log('Data for clicked row:', userData);

            const imageSrcArray = userData.photos || [];
            const imageGallery = document.getElementById("imageGallery");


            imageGallery.innerHTML = '';

            if (imageSrcArray.length > 0) {
              imageSrcArray.forEach(imageSrc => {
                const imgElement = document.createElement('img');
                imgElement.src = imageSrc;

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
              imageGallery.innerHTML = `<p>No images available.</p>`;
            }
          });
        });
      })
      .catch((error) => console.error('Error fetching data:', error));
  }




  populateTable();


  const addForm = document.getElementById('add-user-form');

  function formatDateToMMDD(dateString) {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
  }

  function editRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;
    const accessToken = getAccessTokenFromLocalStorage();

    if (!editForm) {
      console.error('editForm not found.');
      return;
    }

    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/seasons/${userId}`, {
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

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        } else {
          console.error('Invalid response content type:', contentType);
          throw new Error('Invalid response content type.');
        }
      })
      .then(users => {
        const user = users[0];

        // Log the entire user object to the console
        console.log('User data:', user);

        // Check if the form and elements exist before accessing them
        if (!editForm.elements) {
          console.error('Form elements not found.');
          return;
        }

        // Update form elements with user data
        editForm.elements.id.value = user.id;
        editForm.elements.name.value = user.name;
        editForm.elements.description.value = user.description;
        editForm.elements.from_date.value = formatDate(user.from_date);
        editForm.elements.to_date.value = formatDate(user.to_date);
        editModal.show();
      })
      .catch(error => console.error('Error fetching user data:', error));
  }


// Handle edit form submission
editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(editForm);
  const updatedUser = {};

  formData.forEach((value, key) => {
      if (value !== '[object Object]') {
          updatedUser[key] = value;
      }
  });

  console.log('Edited User Data:', updatedUser);

  const accessToken = getAccessTokenFromLocalStorage();

  try {
      updatedUser.id = formData.get('id');

      // Convert "Month day" to the desired format
      updatedUser.from_date = convertToServerFormat(updatedUser.from_date);
      updatedUser.to_date = convertToServerFormat(updatedUser.to_date);

      sendEditRequest(updatedUser, accessToken);
  } catch (error) {
      console.error('There was a problem with form submission:', error);
  }
});

async function sendEditRequest(updatedUser, accessToken) {
  console.log('EDIT: ' + JSON.stringify(updatedUser));
  try {
      if (!updatedUser.id) {
          console.error('Error updating item data: Invalid ID');
          return;
      }

      // Exclude unnecessary fields before sending the request
      const { created_at, updated_at, from_date, to_date, ...requestData } = updatedUser;

      // Check if from_date and to_date have been modified
      if (from_date !== updatedUser.original_from_date) {
          requestData.from_date = convertToServerFormat(from_date);
      }

      if (to_date !== updatedUser.original_to_date) {
          requestData.to_date = convertToServerFormat(to_date);
      }

      const apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/seasons/${updatedUser.id}`;
      console.log('Sending PATCH request to URL:', apiUrl);
      console.log('Sending PATCH request with updatedUser:', requestData);

      const response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestData),
      });

      if (!response.ok) {
          console.error('Error updating item data:', response.status);
          return;
      }

      if (response.status === 200 || response.status === 201) {
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



function convertToServerFormat(dateString) {
  // Extract the year, month, and day from the existing date string
  const existingDate = new Date(dateString);
  const year = existingDate.getFullYear();
  const month = existingDate.getMonth() + 1; // Months are zero-indexed
  const day = existingDate.getDate();

  // Create a new date object with the extracted values
  const date = new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00Z`);

  // Ensure the date is valid before calling toISOString()
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return date.toISOString();
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




  addButton.addEventListener('click', () => {
    addEventModal.show();
  });

  addAccountButton.addEventListener('click', async () => {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);
    const accessToken = getAccessTokenFromLocalStorage();

    // Format date strings to match the server's expectation
    const formattedData = {
      ...Object.fromEntries(formData.entries()),
      from_date: formatDateString(formData.get('from_date')),
      to_date: formatDateString(formData.get('to_date')),
    };

    try {
      const addUserResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/seasons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      console.log('Data Sent to Server:', JSON.stringify(formattedData));

      console.log('Response from server:', addUserResponse.status, addUserResponse.statusText);

      if (addUserResponse.ok) {
        form.reset();
        window.location.reload();
        populateTable();
      } else {
        const responseBody = await addUserResponse.text();
        console.error('Error:', addUserResponse.status, addUserResponse.statusText, responseBody);
        alert('Error adding account. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error adding account. Please try again.');
    }
  });

  // Function to format date string to match server expectation
  function formatDateString(dateString) {
    // You may need to adjust the date formatting logic based on the actual input format
    const [month, day] = dateString.split(' ');
    const monthNumber = getMonthNumber(month);
    const formattedDate = `2001-${monthNumber.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
    return formattedDate;
  }

  // Function to get the month number from its name
  function getMonthNumber(monthName) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return (months.indexOf(monthName) + 1).toString();
  }


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
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
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


