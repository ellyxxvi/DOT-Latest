document.addEventListener("DOMContentLoaded", function () {
    const favoritesButton = document.getElementById("favoritesButton");
    const visitedButton = document.getElementById("visitedButton");
    const accountButton = document.getElementById("accountButton");
    //const boxContainer = document.querySelector('.box-container');
    const editProfileButton = document.querySelector('.edit-profile-button');
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));

    // Function to handle errors
    function handleErrors(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    }


    document.getElementById("confirmLogout").addEventListener("click", function () {
        console.log("Click");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_data");
        window.location.href = "login_register.php";
    });

    // EDIT PROFILE
    editProfileButton.addEventListener('click', function () {
        editModal.show();
        fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users`)
            .then(response => response.json())
            .then(data => {
                const user = JSON.parse(localStorage.getItem('user_data'));
                if (user) {
                    document.getElementById('edit-id').value = user.id;
                    document.getElementById('existingImage').value = user.profile_photo;
                    document.getElementById('first_name').value = user.first_name;
                    document.getElementById('last_name').value = user.last_name;
                    document.getElementById('gender').value = user.gender;
                    document.getElementById('email').value = user.email;
                    document.getElementById('password').value = user.password;
                    document.getElementById('from_country').value = user.from_country;
                    document.getElementById('current_province').value = user.current_province;
                    document.getElementById('current_city').value = user.current_city;
                    document.getElementById('current_barangay').value = user.current_barangay;

                    // Display the existing image URL
                    const existingImageURL = user.profile_photo;
                    const imagePreview = document.getElementById('edit-image-preview');
                    imagePreview.src = existingImageURL;

                    // Store the existing image URL in a hidden input field
                    editForm.elements.existingImage.value = existingImageURL;

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
        const userId = document.getElementById('edit-id').value;
        
        const updatedUserData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            gender: document.getElementById('gender').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            from_country: document.getElementById('from_country').value,
            current_province: document.getElementById('current_province').value,
            current_city: document.getElementById('current_city').value,
            current_barangay: document.getElementById('current_barangay').value,
        };

        fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUserData),
        })
            .then(response => {
                if (response.ok) {
                    console.log('Profile updated successfully');
                    localStorage.setItem('user_data', JSON.stringify(updatedUserData));
                    this.location.reload();
                } else {
                    console.error('Failed to update profile');
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
            });

    });
    const editForm = document.getElementById('edit-user-form');

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
            var formData2 = new FormData();
            formData2.append('photo', imageFile);

            fetch(`${API_PROTOCOL}://${API_HOSTNAME}/images`, {
                method: 'POST',
                body: formData2
            })
                .then(handleErrors)
                .then(data => {
                    console.log('Uploaded image URL:', data.http_img_url);

                    updatedUser.profile_photo = data.http_img_url;
                    sendEditRequest(updatedUser);
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
    });

    function sendEditRequest(updatedUser) {
        const userId = updatedUser.id;
        fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Profile updated:', data);
                window.location.reload();
                editModal.hide();
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
        //console.log("Fetch user: " + response.json() );
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
            return data; // Return the array as is
        } else if (data) {
            return [data]; // Convert a single preference entry to an array
        } else {
            return []; // Return an empty array if there's no preference data
        }
    })
    .catch((preferenceError) => {
        console.error('Error fetching preference data:', preferenceError);
        return []; // Return an empty array in case of an error
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
    // console.log("TEST ACCESS : " + accessToken);
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
                        // Check if preferenceData is an array before using find
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
            { label: "City:", value: user.current_city },
            { label: "Barangay:", value: user.current_barangay },
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



