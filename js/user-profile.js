var config = {
    cUrl: 'https://api.countrystatecity.in/v1/countries',
    ckey: 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
};

var countrySelect = document.getElementById('from_country'),
    stateSelect = document.getElementById('current_province')
    // citySelect = document.getElementById('current_city');

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

    stateSelect.disabled = false
    // citySelect.disabled = false
    stateSelect.style.pointerEvents = 'none'
    // citySelect.style.pointerEvents = 'none'
}

function loadStates(selectedCountryCode1 = null, current_province = null, current_city = null) {
    stateSelect.disabled = false
    // citySelect.disabled = false
    stateSelect.style.pointerEvents = 'auto'
    // citySelect.style.pointerEvents = 'none'

    var selectedCountryCode = selectedCountryCode1;
    if(selectedCountryCode1 != null) {
        selectedCountryCode = countrySelect.value;
    }
    console.log(selectedCountryCode);
    stateSelect.innerHTML = '<option value="">Select State</option>' // for clearing the existing states
    // citySelect.innerHTML = '<option value="">Select City</option>' // Clear existing city options
    console.log("Test: " + `${config.cUrl}/${selectedCountryCode}/states`, {headers: {"X-CSCAPI-KEY": config.ckey}});
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
    .then(data => {
        if(current_province != null) {
            selectOptionByText(stateSelect, current_province);
        }
        // if(current_city != null) {
        //     loadCities(current_city);
        // }
        
    })
    .catch(error => console.error('Error loading countries:', error))
}

// function loadCities(current_city = null) {
//     citySelect.disabled = false
//     citySelect.style.pointerEvents = 'auto'

//     const selectedCountryCode = countrySelect.value
//     const selectedStateCode = stateSelect.value
//     console.log("loadCities: " +selectedCountryCode, selectedStateCode);

//     citySelect.innerHTML = '<option value="">Select City</option>' // Clear existing city options

//     fetch(`${config.cUrl}/${selectedCountryCode}/states/${selectedStateCode}/cities`, {headers: {"X-CSCAPI-KEY": config.ckey}})
//     .then(response => response.json())
//     .then(data => {
//         // console.log(data);

//         data.forEach(city => {
//             const option = document.createElement('option')
//             option.value = city.iso2
//             option.textContent = city.name 
//             citySelect.appendChild(option)
//         })
//     })
//     .then(data => {
//         if(current_city != null) {
//             selectOptionByText(citySelect, current_city);
//         }
//     })

// }

    function selectOptionByText(selectElement, text) {
        for (const option of selectElement.options) {
            if (option.text === text) {
                option.selected = true;
                return;
            }
        }
        // Handle the case where the text is not found
        console.warn(`Option with text '${text}' not found in select element.`);
    }
document.addEventListener("DOMContentLoaded", function () {
    const favoritesButton = document.getElementById("favoritesButton");
    const visitedButton = document.getElementById("visitedButton");
    const accountButton = document.getElementById("accountButton");
    const builderButton = document.getElementById("builderButton");
    //const boxContainer = document.querySelector('.box-container');
    const editProfileButton = document.querySelector('.edit-profile-button');
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    loadCountries(); 
    loadStates();
    // loadCities();
    countrySelect.addEventListener('change', loadStates);

    // stateSelect.addEventListener('change', loadCities);

    builderButton.addEventListener("click", function () {
        window.location.href = "itinerary-builder.php";
      });

    // Function to handle errors
    function handleErrors(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    }


    document.getElementById("confirmLogout").addEventListener("click", function () {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_data");
        window.location.href = "login_register.php";
    });
    function parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }
    // EDIT PROFILE
    editProfileButton.addEventListener('click', function () {
        editModal.show();
        const accessToken = localStorage.getItem('access_token');
        const userId = parseJwt(accessToken);
        fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId.id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('edit-id').value = data.id;
                document.getElementById('existingImage').value = data.profile_photo;
                document.getElementById('first_name').value = data.first_name;
                document.getElementById('last_name').value = data.last_name;
                document.getElementById('current_city').value = data.current_city;
                
                // Set the country selection
                const countrySelect = document.getElementById('from_country');
                selectOptionByText(countrySelect, data.from_country);
                console.log("editProfileButton: " + data.from_country + " || " + data.current_province);
                loadStates(data.from_country, data.current_province);
                
                // Set the province selection
                // const stateSelect = document.getElementById('current_province');
                // selectOptionByText(stateSelect, data.current_province);
                // console.log("stateSelect: "  + data.current_province);
                // stateSelect.selected = data.current_province;
                
                // // Set the city selection
                // const citySelect = document.getElementById('current_city');
                // selectOptionByText(citySelect, data.current_city);
    
                const existingImageURL = data.profile_photo;
                const imagePreview = document.getElementById('edit-image-preview');
                imagePreview.src = existingImageURL;
    
                const editForm = document.getElementById('edit-form'); 
                editForm.elements['existingImage'].value = existingImageURL;
    
                editModal.show();
            } else {
                console.error("No user data found.");
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
    });
    

    
    document.getElementById('updateProfileButton').addEventListener('click', function () {
        const accessToken = localStorage.getItem('access_token');
        const userId = document.getElementById('edit-id').value;
        const countrySelect = document.getElementById('from_country');
        const stateSelect = document.getElementById('current_province');
        const from_country = countrySelect.options[countrySelect.selectedIndex].text;
        const current_province = stateSelect.options[stateSelect.selectedIndex].text;

        
        const updatedUserData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            from_country: from_country, 
            current_province: current_province, 
            current_city: current_city,
            role : "REGULAR"

        };

    });
    const editForm = document.getElementById('edit-user-form');

    editForm.addEventListener('submit', event => {
        const accessToken = localStorage.getItem('access_token');
        event.preventDefault();
        const formData = new FormData(editForm);
        const updatedUser = {};
        formData.forEach((value, key) => {
            if(key != "created_at" && key != "updated_at" && key != "email" && key != "existingImage" && key != "gender" && key != "password"){
                updatedUser[key] = value;
            }
        });
        updatedUser["role"]= "REGULAR";
        const imageInput = editForm.querySelector('input[type="file"]');
        const imageFile = imageInput.files[0];
    
        if (imageFile) {
            var formData2 = new FormData();
            formData2.append('photo', imageFile);
        
            fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
                method: 'POST',
                body: formData2,
                headers: {
                    'Authorization': `Bearer ${accessToken}` 
                }
            })
            .then(handleErrors)
            .then(data => {
        
                updatedUser.profile_photo = data.http_img_url;
                sendEditRequest(updatedUser);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        } else {
            updatedUser.profile_photo = document.getElementById('existingImage').value;
            sendEditRequest(updatedUser);
        }
    });
    
    function sendEditRequest(updatedUser) {
        const accessToken = localStorage.getItem('access_token');
        const userId = updatedUser.id;
        delete updatedUser.id; 
        updatedUser.from_country = document.getElementById('from_country').options[document.getElementById('from_country').selectedIndex].text;
        updatedUser.current_province = document.getElementById('current_province').options[document.getElementById('current_province').selectedIndex].text;

        fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(updatedUser),
        })
            .then(response => {
                if (response.ok) {
                    alert('Profile updated successfully');
                    window.location.reload(); 
                    editModal.hide();
                } else {
                    console.error('Failed to update profile');
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
            });
    }

    favoritesButton.addEventListener("click", function () {
        window.location.href = "itinerary_favorites.php";
    });

    visitedButton.addEventListener("click", function () {
        window.location.href = "itinerary_visited.php";
    });
    accountButton.addEventListener("click", function () {
        window.location.href = "user-profile.php";
    });
    const images = [
        'image/places/churches.png',
        'image/places/hotels.png',
        'image/places/naturetrip.png',
    ];

    const carouselInner = document.querySelector('.carousel-inner');

    images.forEach((imageUrl, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) {
            carouselItem.classList.add('active');
        }
        const image = document.createElement('img');
        image.src = imageUrl;
        image.classList.add('d-block', 'w-100', 'vh-100', 'object-fit-cover');
        carouselItem.appendChild(image);
        carouselInner.appendChild(carouselItem);
    });
});

// USER PROFILE

function fetchUserData() {
    const accessToken = localStorage.getItem('access_token');
    var userId = localStorage.getItem("user_id");
    return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}` 
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error fetching user data: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        return data;
    });
}


// Function to fetch preference data as an array
function fetchPreferenceData() {
    const token = localStorage.getItem('access_token'); 
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/preferences`, {
        headers: headers
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Error fetching preference data: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        if (Array.isArray(data)) {
            return data; 
        } else if (data) {
            return [data]; 
        } else {
            return []; 
        }
    })
    .catch((preferenceError) => {
        console.error('Error fetching preference data:', preferenceError);
        return []; 
    });
}

  

// Function to update the user profile
function updateProfile() {
    const isLoggedIn = localStorage.getItem('access_token') !== null;
    const accessToken = getAccessTokenFromLocalStorage(); 
    if (!isLoggedIn) {
        console.error('User is not logged in.');
        return;
    }
    const decoded = parseJwt(accessToken);

    var userId = decoded.id;

    // Fetch user data using the access token
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}` 
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching user data: ${response.status}`);
            }
            return response.json();
        })
        .then(user => {
            fetchPreferenceData()
                .then(preferenceData => {
                    if (Array.isArray(preferenceData)) {
                        const userPreferences = preferenceData.find(preference => preference.user_id === user.id);

                        if (userPreferences && userPreferences.preferenced_categories && userPreferences.preferenced_categories.length > 0) {
                            populateUserData(user, userPreferences.preferenced_categories);
                        } else {
                            console.error('User preferences not found in data.');
                        }
                    } else {
                        console.error('Preference data is not an array.');
                    }
                })
                .catch(preferenceError => {
                    console.error('Error fetching preference data:', preferenceError);
                });
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token');
    return accessToken;
}




function populateUserData(user, preferenced_categories) {
    const nameHolder = document.querySelector(".nameHolder");
    if (nameHolder) {
        nameHolder.textContent = `${user.first_name} ${user.last_name}`;
    } else {
        console.error("nameHolder element not found.");
    }
    const profileImg = document.querySelector(".profile-img img");
    if (profileImg) {
        profileImg.src = user.profile_photo;
    } else {
        console.error("profile-img img element not found.");
    }

    const preferencesElement = document.querySelector(".profile-work");
    if (preferencesElement) {

        preferencesElement.innerHTML = "";


        if (preferenced_categories && preferenced_categories.length > 0) {
            const preferenceTitle = document.createElement("p");
            preferenceTitle.textContent = "Preferences:";
            preferencesElement.appendChild(preferenceTitle);


            const preferenceList = document.createElement("ul");

            preferenced_categories.forEach((preference) => {
                const preferenceItem = document.createElement("li");
                preferenceItem.textContent = preference;
                preferenceList.appendChild(preferenceItem);
            });

            preferencesElement.appendChild(preferenceList);
        }
    } else {
        console.error("profile-work element not found.");
    }

    const table = document.querySelector("table");
    if (table) {
        table.innerHTML = "";

        const userData = [
            { label: "First Name:", value: user.first_name },
            { label: "Last Name:", value: user.last_name },
            { label: "Gender:", value: user.gender },
            { label: "Email:", value: user.email },
            { label: "Country:", value: user.from_country },
            { label: "Province:", value: user.current_province },
            { label: "City:", value: user.current_city }
            // { label: "Barangay:", value: user.current_barangay },
        ];

        userData.forEach((item) => {
            const row = document.createElement("tr");
            const labelCell = document.createElement("th");
            const valueCell = document.createElement("td");
            labelCell.textContent = item.label;
            valueCell.textContent = item.value;
            row.appendChild(labelCell);
            row.appendChild(valueCell);
            table.appendChild(row);
        });
    } else {
        console.error("table element not found.");
    }
}

updateProfile();



