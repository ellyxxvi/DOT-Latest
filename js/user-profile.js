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
        // var userId = localStorage.getItem("user_id");
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
                // document.getElementById('gender').value = data.gender;
                // document.getElementById('email').value = data.email;
                // document.getElementById('password').value = data.password;
                document.getElementById('from_country').value = data.from_country;
                document.getElementById('current_province').value = data.current_province;
                document.getElementById('current_city').value = data.current_city;
                document.getElementById('current_barangay').value = data.current_barangay;

                // Display the existing image URL
                const existingImageURL = data.profile_photo;
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
        const accessToken = localStorage.getItem('access_token');
        const userId = document.getElementById('edit-id').value;
        
        const updatedUserData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            //gender: document.getElementById('gender').value,
            email: document.getElementById('email').value,
            //password: document.getElementById('password').value,
            from_country: document.getElementById('from_country').value,
            current_province: document.getElementById('current_province').value,
            current_city: document.getElementById('current_city').value,
            current_barangay: document.getElementById('current_barangay').value,
            role : "REGULAR"

        };

        // fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users/${userId}`, {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${accessToken}`
        //     },
        //     body: JSON.stringify(updatedUserData),
        // })
        //     .then(response => {
        //         if (response.ok) {
        //             console.log('Profile updated successfully');
        //             localStorage.setItem('user_data', JSON.stringify(updatedUserData));
        //             this.location.reload();
        //         } else {
        //             console.error('Failed to update profile');
        //         }
        //     })
        //     .catch(error => {
        //         console.error('Error updating profile:', error);
        //     });

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
            // No new image selected, preserve the existing image URL
            updatedUser.profile_photo = document.getElementById('existingImage').value;
            sendEditRequest(updatedUser);
        }
    });
    
    function sendEditRequest(updatedUser) {
        const accessToken = localStorage.getItem('access_token');
        const userId = updatedUser.id;
        delete updatedUser.id; // Remove the id property from updatedUser

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
                    // localStorage.setItem('user_data', JSON.stringify(updatedUser));
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
            return data; 
        } else if (data) {
            return [data]; 
        } else {
            return []; 
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
    // console.log("User: " + JSON.stringify(user));
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



