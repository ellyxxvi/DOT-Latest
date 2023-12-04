// Modal for adding a user
$(document).ready(function () {
  $("#addButton").click(function () {
    $("#addModal").modal("show");
  });
});
const API_PROTOCOL = 'https'
const API_HOSTNAME = 'goexplorebatangas.com/api'
// const API_PROTOCOL = 'http'
// const API_HOSTNAME = '13.229.101.17/api'

var config = {
  cUrl: 'https://api.countrystatecity.in/v1/countries',
  ckey: 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
};

var countrySelect = document.getElementById('from_country'),
  stateSelect = document.getElementById('current_province');
  // citySelect = document.getElementById('current_city');

  var editcountrySelect = document.getElementById('edit_from_country'),
  editstateSelect = document.getElementById('edit_current_province');
  // editcitySelect = document.getElementById('edit_current_city');

function loadCountries() {

  let apiEndPoint = config.cUrl

  fetch(apiEndPoint, {headers: {"X-CSCAPI-KEY": config.ckey}})
  .then(Response => Response.json())
  .then(data => {
      // console.log(data);

      data.forEach(country => {
          const option = document.createElement('option')
          option.value = country.iso2
          option.textContent = country.name 
          countrySelect.appendChild(option)
      })
  })
  .catch(error => console.error('Error loading countries:', error))

  stateSelect.disabled = true
  // citySelect.disabled = true
  stateSelect.style.pointerEvents = 'none'
  // citySelect.style.pointerEvents = 'none'
}

function loadStates() {
  stateSelect.disabled = false
  // citySelect.disabled = true
  stateSelect.style.pointerEvents = 'auto'
  // citySelect.style.pointerEvents = 'none'

  const selectedCountryCode = countrySelect.value
  // console.log(selectedCountryCode);
  stateSelect.innerHTML = '<option value="">Select State</option>' // for clearing the existing states
  // citySelect.innerHTML = '<option value="">Select City</option>' // Clear existing city options

  fetch(`${config.cUrl}/${selectedCountryCode}/states`, {headers: {"X-CSCAPI-KEY": config.ckey}})
  .then(response => response.json())
  .then(data => {
      // console.log(data);

      data.forEach(state => {
          const option = document.createElement('option')
          option.value = state.iso2
          option.textContent = state.name 
          stateSelect.appendChild(option)
      })
  })
  .catch(error => console.error('Error loading countries:', error))
}

// function loadCities() {
//   citySelect.disabled = false
//   citySelect.style.pointerEvents = 'auto'

//   const selectedCountryCode = countrySelect.value
//   const selectedStateCode = stateSelect.value
//   // console.log(selectedCountryCode, selectedStateCode);

//   citySelect.innerHTML = '<option value="">Select City</option>' // Clear existing city options

//   fetch(`${config.cUrl}/${selectedCountryCode}/states/${selectedStateCode}/cities`, {headers: {"X-CSCAPI-KEY": config.ckey}})
//   .then(response => response.json())
//   .then(data => {
//       // console.log(data);

//       data.forEach(city => {
//           const option = document.createElement('option')
//           option.value = city.iso2
//           option.textContent = city.name 
//           citySelect.appendChild(option)
//       })
//   })
// }


function loadCountriesEdit() {

  let apiEndPoint = config.cUrl

  fetch(apiEndPoint, {headers: {"X-CSCAPI-KEY": config.ckey}})
  .then(Response => Response.json())
  .then(data => {
      // console.log(data);

      data.forEach(country => {
          const option = document.createElement('option')
          option.value = country.iso2
          option.textContent = country.name 
          editcountrySelect.appendChild(option)
      })
  })
  .catch(error => console.error('Error loading countries:', error))

  editstateSelect.disabled = true
  // editcitySelect.disabled = true
  editstateSelect.style.pointerEvents = 'none'
  // editcitySelect.style.pointerEvents = 'none'
}

function loadStatesEdit(selectedCountryCode1 = null, current_province = null) {
  editstateSelect.disabled = false
  // editcitySelect.disabled = true
  editstateSelect.style.pointerEvents = 'auto'
  // editcitySelect.style.pointerEvents = 'none'

  var selectedCountryCode = selectedCountryCode1;
  if(selectedCountryCode1 != null) {
      selectedCountryCode = editcountrySelect.value;
  }
  console.log("Country: " + selectedCountryCode + " " + current_province);
  editstateSelect.innerHTML = '<option value="">Select State</option>' // for clearing the existing states
  // editcitySelect.innerHTML = '<option value="">Select City</option>' // Clear existing city options

  fetch(`${config.cUrl}/${selectedCountryCode}/states`, {headers: {"X-CSCAPI-KEY": config.ckey}})
  .then(response => response.json())
  .then(data => {
      // console.log(data);

      data.forEach(state => {
          const option = document.createElement('option')
          option.value = state.iso2
          option.textContent = state.name 
          editstateSelect.appendChild(option)
      })
  })
  .then(data => {
    if(current_province != null) {
        selectOptionByText(editstateSelect, current_province);
    }
    // if(current_city != null) {
    //   loadCitiesEdit(current_city);
    // }
    
})
  .catch(error => console.error('Error loading countries:', error))
}

// function loadCitiesEdit(current_city = null) {
//   editcitySelect.disabled = false
//   editcitySelect.style.pointerEvents = 'auto'

//   var selectedCountryCode = editcountrySelect.value
//   var selectedStateCode = editstateSelect.value
//   console.log("loadCitiesEdit " + selectedCountryCode, selectedStateCode);

//   editcitySelect.innerHTML = '<option value="">Select City</option>' // Clear existing city options

//   fetch(`${config.cUrl}/${selectedCountryCode}/states/${selectedStateCode}/cities`, {headers: {"X-CSCAPI-KEY": config.ckey}})
//   .then(response => response.json())
//   .then(data => {
//       // console.log(data);

//       data.forEach(city => {
//           const option = document.createElement('option')
//           option.value = city.iso2
//           option.textContent = city.name 
//           editcitySelect.appendChild(option)
//       })
//   })
//   .then(data => {
//     if(current_city != null) {
//         selectOptionByText(editcitySelect, current_city);
//     }
// })
// }

  // Helper function to select an option by text
  function selectOptionByText(selectElement, text) {
    for (const option of selectElement.options) {
      if (option.text === text) {
        option.selected = true;
        return;
      }
    }
  }

// User Management Data
document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('tableBody');
  const addButton = document.getElementById('addButton');
  const addModal = new bootstrap.Modal(document.getElementById('addModal'));
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editForm = document.getElementById('edit-user-form');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  const addAccountButton = document.getElementById('btn-add-account');
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
    const userRole = getUserRoleFromAccessToken();
    if (userRole !== 'SUPER_ADMIN') {
      // Redirect or hide table if the user is not SUPER_ADMIN
      alert('Access denied: You do not have permission to view this page.');
      window.location.href = 'index.html'; // Redirect to another page
      return; // Stop executing further code
    }

  // Initial population of the table with all data
  populateTable();

  loadCountries(); 
  loadStates();
  // loadCities();
  loadCountriesEdit(); 
  loadStatesEdit();
  // loadCitiesEdit();
  countrySelect.addEventListener('change', loadStates);

  // stateSelect.addEventListener('change', loadCities);

  editcountrySelect.addEventListener('change', loadStatesEdit);

  // editstateSelect.addEventListener('change', loadCitiesEdit);

  // Function to handle errors
  async function handleErrors(response) {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return await response.json();
  }

  async function populateTable(searchKeyword = '') {
    const accessToken = getAccessTokenFromLocalStorage();
    let searchUrl = `${API_PROTOCOL}://${API_HOSTNAME}/users?role=REGULAR`;

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Access-Control-Allow-Origin': '*'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      const data = await response.json();

      const filteredData = data.filter(user => {
        const keywords = [
          user.first_name,
          user.last_name,
          user.gender,
          user.email,
          user.from_country,
          user.current_province,
          user.current_city,
          // user.current_barangay
        ];
        return keywords.some(keyword => keyword.includes(searchKeyword));
      });
      // Sort filteredData by created_at in descending order (newest first)
      filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
            <td><img src="${user.profile_photo || getDefaultProfilePhoto(user.gender)}" alt=""
                        class="img-thumbnail" width="100px"></td>
            <td>${user.first_name}</td>
            <td>${user.last_name}</td>
            <td>${user.gender}</td>
            <td>${user.email}</td>
            <td>${maskPassword(user.password)}</td>
            <td>${user.from_country}</td>
            <td>${user.current_province}</td>
            <td>${user.current_city}</td>
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
            const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}?role=ADMIN`, {
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  function getDefaultProfilePhoto(gender) {
    if (gender === "female") {
        return "../image/female.png"; 
    } else if (gender === "male") {
        return "../image/male.png"; 
    } else {
        console.error("Unknown gender:", gender);
        return ""; 
    }
}

  searchButton.addEventListener('click', () => {
    const searchKeyword = searchInput.value.trim();
    populateTable(searchKeyword);
  });

  function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    return accessToken;
  }

  async function editRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;
  
    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}?role=REGULAR`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      const user = await handleErrors(response);
  
      // Populate form with user data
      editForm.elements.id.value = user.id;
      editForm.elements.first_name.value = user.first_name;
      editForm.elements.last_name.value = user.last_name;
      // Set the country selection
      var editcountrySelect = document.getElementById('edit_from_country');
      selectOptionByText(editcountrySelect, user.from_country);
      console.log("Edit Row: " + user.from_country + " || " + user.current_province);
      loadStatesEdit(user.from_country, user.current_province);
      editForm.elements.current_city.value = user.current_city;
      // selectOptionByText(document.getElementById('edit_from_country'), user.from_country);
      // selectOptionByText(document.getElementById('edit_current_province'), user.current_province);
      // selectOptionByText(document.getElementById('edit_current_city'), user.current_city);
  
      // Handle image preview
      const existingImageURL = user.profile_photo;
      const imagePreview = document.getElementById('edit-image-preview');
      imagePreview.src = existingImageURL;
      editForm.elements.existingImage.value = existingImageURL;
  
      // Show the edit modal
      editModal.show();
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
  

  
  // Handle edit form submission
  editForm.addEventListener('submit', async event => {
    event.preventDefault();
  
    const updatedUser = Object.fromEntries(new FormData(editForm).entries());
  
    // Include the selected text for country, province, and city
    updatedUser.from_country = document.getElementById('edit_from_country').selectedOptions[0].text;
    updatedUser.current_province = document.getElementById('edit_current_province').selectedOptions[0].text;
    // updatedUser.current_city = document.getElementById('edit_current_city').selectedOptions[0].text;
  
    // Handle image file
    const imageInput = editForm.querySelector('#profile_photo');
    const imageFile = imageInput.files[0];
    const accessToken = getAccessTokenFromLocalStorage();
  
    try {
      if (imageFile) {
        const formData2 = new FormData();
        formData2.append('photo', imageFile);
  
        const imageResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData2
        });
        const imageData = await handleErrors(imageResponse);
        updatedUser.profile_photo = imageData.http_img_url;
      } else {
        updatedUser.profile_photo = editForm.elements.existingImage.value;
      }
  
      await sendEditRequest(updatedUser, accessToken);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  });

  async function sendEditRequest(updatedUser, accessToken) {
    try {
      // Check if updatedUser has a valid 'id' property
      if (!updatedUser.id) {
        console.error('Missing user ID in the updatedUser object');
        return;
      }
  
      const apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/users/${updatedUser.id}`;
  
      // Create a clean user object with only the relevant fields
      const cleanUser = {
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        password: updatedUser.password,
        from_country: updatedUser.from_country,
        current_province: updatedUser.current_province,
        current_city: updatedUser.current_city,
        profile_photo: updatedUser.profile_photo,
      };
  
  
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanUser),
      });
  
  
      // Check for a successful response (HTTP status code 2xx)
      if (response.ok) {
        editForm.reset();
        editModal.hide();
        populateTable();
      } else {
        // Handle any errors returned by the server
        const errorResponse = await response.json();
        console.error('Server Error Response:', JSON.stringify(errorResponse, null, 2));
        throw new Error(`Error updating user data: ${errorResponse.message}`);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }


  addAccountButton.addEventListener('click', async () => {
    const form = document.getElementById('add-user-form');
    const formData = new FormData(form);
    const countrySelect = document.getElementById('from_country');
    const stateSelect = document.getElementById('current_province');
    // const citySelect = document.getElementById('current_city');
    const from_country = countrySelect.options[countrySelect.selectedIndex].text;
    const current_province = stateSelect.options[stateSelect.selectedIndex].text;
    // const current_city = citySelect.options[citySelect.selectedIndex].text;
    const imageInput = form.querySelector("#profile_photo");
    const imageFile = imageInput.files[0];
    const accessToken = getAccessTokenFromLocalStorage();
  
    // Check if there is no image file and any other form data is empty
    if (!imageFile && !formData.has('other_field_name')) { // Add all other form field names you want to check
      alert('Please enter values.'); // Display an alert
      return; // Stop execution of the function
    }
  
    if (imageFile) {
      formData.delete('photo');
      formData.append('photo', imageFile);
  
      var formData2 = new FormData();
      formData2.append('photo', imageFile);
  
      try {
        const imageResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData2,
        });
  
        if (!imageResponse.ok) {
          throw new Error('Image upload failed.');
        }
  
        const imageData = await imageResponse.json();
        const imageDataUrl = imageData.http_img_url;
  
        formData.delete('photo');
        const user = {
          ...Object.fromEntries(formData.entries()),
          profile_photo: imageDataUrl,
          from_country,
          current_province,
          role: "REGULAR"
        };
  
        const userResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(user),
        });
  
        if (!userResponse.ok) {
          throw new Error('User creation failed.');
        }
  
        this.location.reload();
        form.reset();
        populateTable();
      } catch (error) {
        alert('Password must be at least 9 characters long and email must be in correct format.');
      }
    }
  });
  

  // Handle delete button
  async function deleteRow(event) {
    const button = event.target;
    const row = button.closest('tr');
    const userId = row.querySelector('td:first-child').textContent;

    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}?role=REGULAR`, {
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


  // Function to mask password
  function maskPassword(password) {
    return '*'.repeat(password ? password.length : 0);
  }
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
