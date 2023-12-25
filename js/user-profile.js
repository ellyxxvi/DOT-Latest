var config = {
    cUrl: 'https://api.countrystatecity.in/v1/countries',
    ckey: 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
};

var countrySelect = document.getElementById('from_country'),
    stateSelect = document.getElementById('current_province')


function loadCountries() {

    let apiEndPoint = config.cUrl

    fetch(apiEndPoint, { headers: { "X-CSCAPI-KEY": config.ckey } })
        .then(Response => Response.json())
        .then(data => {


            data.forEach(country => {
                const option = document.createElement('option')
                option.value = country.iso2
                option.textContent = country.name
                countrySelect.appendChild(option)
            })
        })
        .catch(error => console.error('Error loading countries:', error))

    stateSelect.disabled = false

    stateSelect.style.pointerEvents = 'none'

}

function loadStates(selectedCountryCode1 = null, current_province = null, current_city = null) {
    stateSelect.disabled = false

    stateSelect.style.pointerEvents = 'auto'


    var selectedCountryCode = selectedCountryCode1;
    if (selectedCountryCode1 != null) {
        selectedCountryCode = countrySelect.value;
    }
    stateSelect.innerHTML = '<option value="">Select State</option>'

    fetch(`${config.cUrl}/${selectedCountryCode}/states`, { headers: { "X-CSCAPI-KEY": config.ckey } })
        .then(response => response.json())
        .then(data => {


            data.forEach(state => {
                const option = document.createElement('option')
                option.value = state.iso2
                option.textContent = state.name
                stateSelect.appendChild(option)
            })

        })
        .then(data => {
            if (current_province != null) {
                selectOptionByText(stateSelect, current_province);
            }

        })
        .catch(error => console.error('Error loading countries:', error))
}

function selectOptionByText(selectElement, text) {
    for (const option of selectElement.options) {
        if (option.text === text) {
            option.selected = true;
            return;
        }
    }
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

    document.getElementById("cancelButton").addEventListener("click", function () {
        // Your code to handle the cancel button click
    });

    countrySelect.addEventListener('change', loadStates);

    builderButton.addEventListener("click", function () {
        window.location.href = "itinerary-builder.php";
    });

    function handleErrors(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    }
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = 'login_register.php';
        return;
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
            loadStates(data.from_country, data.current_province);

            const existingImageURL = data.profile_photo;
            const imagePreview = document.getElementById('edit-image-preview');

            // Check if no existing photo is present
            if (existingImageURL) {
                imagePreview.src = existingImageURL;
                imagePreview.style.display = 'block'; // Show the image preview
            } else {
                imagePreview.style.display = 'none'; // Hide the image preview
            }

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
            role: "REGULAR"

        };

    });
    const editForm = document.getElementById('edit-user-form');

    editForm.addEventListener('submit', event => {
        const accessToken = localStorage.getItem('access_token');
        event.preventDefault();
        const formData = new FormData(editForm);
        const updatedUser = {};
        formData.forEach((value, key) => {
            if (key != "created_at" && key != "updated_at" && key != "email" && key != "existingImage" && key != "gender" && key != "password") {
                updatedUser[key] = value;
            }
        });
        updatedUser["role"] = "REGULAR";
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
        'image/banig.jpg',
        'image/bg1.jpg',
        'image/barako.jpg',
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
    var userId = localStorage.getItem('user_id');
    return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
        .then((response) => {
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
        Authorization: `Bearer ${token}`,
    };

    return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/preferences`, {
        headers: headers,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error fetching preference data: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log('Preference data fetched:', data); // Log fetched data

            if (Array.isArray(data)) {
                return data;
            } else if (data) {
                return [data];
            } else {
                return [];
            }
        })
        .catch((error) => {
            console.error('Error fetching preference data:', error); // Log error
            return [];
        });
}


// Function to update the user profile
function updateProfile() {
    const isLoggedIn = localStorage.getItem('access_token') !== null;
    const accessToken = getAccessTokenFromLocalStorage();
    if (!isLoggedIn) {
        alert('User is not logged in.');
        return;
    }
    const decoded = parseJwt(accessToken);

    var userId = decoded.id;

    // Fetch user data using the access token
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error fetching user data: ${response.status}`);
            }
            return response.json();
        })
        .then((user) => {
            fetchPreferenceData()
                .then((preferenceData) => {
                    const userPreferences = Array.isArray(preferenceData)
                        ? preferenceData.find((preference) => preference.user_id === user.id)
                        : null;

                    populateUserData(
                        user,
                        userPreferences ? userPreferences.preferenced_categories : []
                    );
                })
                .catch((preferenceError) => {
                    console.error('Error fetching preference data:', preferenceError);
                    // Call populateUserData with an empty array if there's an error fetching preferences
                    populateUserData(user, []);
                });
        })
        .catch((error) => {
            console.error('Error fetching user data:', error);
        });
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
        window.atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
}

function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token');
    return accessToken;
}
function editPreferences() {
    fetchPreferenceData().then((userPreferences) => {
        const preferenceButtons = document.querySelectorAll(".preference-button");
        console.log('Fetched User Preferences:', userPreferences);

        const userPreferencesArray = userPreferences.flatMap(pref => pref.preferenced_categories);

        preferenceButtons.forEach((button) => {
            const preferenceValue = button.getAttribute('value').trim();

            const isSelected = userPreferencesArray.map(pref => pref.trim()).includes(preferenceValue);

            console.log(`Button value: ${preferenceValue}, isSelected: ${isSelected}`);

            if (isSelected) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });

        const preferenceModal = new bootstrap.Modal(document.getElementById('preferenceModal'));
        preferenceModal.show();

        preferenceButtons.forEach((button) => {
            button.addEventListener("click", function () {
                this.classList.toggle("selected");
            });
        });
    });
}

document.getElementById('savePreferences').addEventListener('click', function () {
    const selectedPreferences = getSelectedPreferences();
    sendPreferencesToEndpoint(selectedPreferences);
    const preferenceModal = new bootstrap.Modal(document.getElementById('preferenceModal'));
    preferenceModal.hide();
});

function getSelectedPreferences() {
    const selectedPreferences = [];
    const deletedPreferences = [];
    const preferenceButtons = document.querySelectorAll('.preference-button');

    preferenceButtons.forEach((button) => {
        const preferenceValue = button.getAttribute('value').trim();

        if (button.classList.contains('selected')) {
            selectedPreferences.push(preferenceValue);
        } else {
            deletedPreferences.push(preferenceValue);
        }
    });

    return { selected: selectedPreferences, deleted: deletedPreferences };
}

function sendPreferencesToEndpoint(preferences) {
    const accessToken = getAccessTokenFromLocalStorage();

    if (!accessToken) {
        console.error('Access token not available. Preferences cannot be updated.');
        return;
    }

   
    fetchPreferenceData()
        .then((preferenceData) => {
            if (preferenceData.length > 0) {
                const id = preferenceData[0].id;

                if (preferences.selected.length > 0) {
                    const addRequestBody = {
                        preferenced_categories: preferences.selected,
                    };

                    const patchEndpoint = `${API_PROTOCOL}://${API_HOSTNAME}/preferences/${id}`;

                    console.log('PUT endpoint:', patchEndpoint); 
                   
                    return fetch(patchEndpoint, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(addRequestBody),
                    });
                } else {
                    console.warn('No preferences selected to update.');
                }
            } else {
                console.warn('No existing preferences found.');
            }
        })
        .then((response) => {
            if (response && !response.ok) {
                throw new Error(`Error updating preferences: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log('Preferences updated successfully:', data);
             window.location.reload();
        })
        .catch((error) => {
            console.error('Error updating preferences:', error);
        });
}



function populateUserData(user, preferenced_categories) {
    const nameHolder = document.querySelector('.nameHolder');
    if (nameHolder) {
        nameHolder.textContent = `${user.first_name} ${user.last_name}`;
    } else {
        console.error('nameHolder element not found.');
    }
    const profileImg = document.querySelector('.profile-img img');
    if (profileImg) {
        if (user.profile_photo) {
            profileImg.src = user.profile_photo;
        } else {
            if (user.gender === 'female') {
                profileImg.src = 'image/female.png';
            } else if (user.gender === 'male') {
                profileImg.src = 'image/male.png';
            } else {
                console.error('Unknown gender:', user.gender);
            }
        }
    } else {
        console.error('profile-img img element not found.');
    }

    const preferencesElement = document.querySelector('.profile-work');

    if (preferencesElement) {
        preferencesElement.innerHTML = '';

        const preferenceTitle = document.createElement('p');
        preferenceTitle.innerHTML =
            'Preference <a href="#" class="edit-button" onclick="editPreferences()"><i class="fas fa-edit"></i></a>';

        preferencesElement.appendChild(preferenceTitle);

        if (preferenced_categories && preferenced_categories.length > 0) {
            const preferenceList = document.createElement('ul');
            preferenceList.classList.add('fa-ul');

            preferenced_categories.forEach((preference) => {
                const preferenceItem = document.createElement('li');

                const icon = document.createElement('i');
                icon.classList.add('fas', 'fa-check', 'fa-li');

                preferenceItem.appendChild(icon);
                preferenceItem.appendChild(document.createTextNode(` ${preference}`));

                preferenceList.appendChild(preferenceItem);
            });

            preferencesElement.appendChild(preferenceList);
        }
    } else {
        console.error('profile-work element not found.');
    }

    const table = document.querySelector('table');
    if (table) {
        table.innerHTML = '';

        const userData = [
            { label: 'First Name:', value: user.first_name },
            { label: 'Last Name:', value: user.last_name },
            { label: 'Gender:', value: user.gender },
            { label: 'Email:', value: user.email },
            { label: 'Country:', value: user.from_country },
            { label: 'Province:', value: user.current_province },
            { label: 'City:', value: user.current_city },
            // { label: "Barangay:", value: user.current_barangay },
        ];

        userData.forEach((item) => {
            const row = document.createElement('tr');
            const labelCell = document.createElement('th');
            const valueCell = document.createElement('td');
            labelCell.textContent = item.label;
            valueCell.textContent = item.value;
            row.appendChild(labelCell);
            row.appendChild(valueCell);
            table.appendChild(row);
        });
    } else {
        console.error('table element not found.');
    }
}

updateProfile();




