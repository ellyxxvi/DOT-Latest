document.addEventListener("DOMContentLoaded", function () {
    const favoritesButton = document.getElementById("favoritesButton");
    const visitedButton = document.getElementById("visitedButton");
    const accountButton = document.getElementById("accountButton");
    const completedButtons = document.querySelectorAll('.completed-button');
    const ratingModal = new bootstrap.Modal(document.getElementById('ratingModal'));
    const saveRatingButton = document.getElementById('saveRating');
    const stars = document.querySelectorAll('.star');
    const boxContainer = document.querySelector('.box-container');
    const editProfileButton = document.querySelector('.edit-profile-button');
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));

    let selectedPlaceId;
    let selectedUserId;

    document.getElementById("confirmLogout").addEventListener("click", function () {
        console.log("Click");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_data");
        window.location.href = "login_register.php";
    });

    // EDIT PROFILE
    editProfileButton.addEventListener('click', function () {
        editModal.show();
        fetch('http://localhost:3000/users')
            .then(response => response.json())
            .then(data => {
                const user = JSON.parse(localStorage.getItem('user_data'));
                if (user) {
                    document.getElementById('edit-id').value = user.id;
                    document.getElementById('existingImage').value = user.image;
                    document.getElementById('first_name').value = user.first_name;
                    document.getElementById('last_name').value = user.last_name;
                    document.getElementById('gender').value = user.gender;
                    document.getElementById('email').value = user.email;
                    document.getElementById('password').value = user.password;
                    document.getElementById('from_country').value = user.from_country;
                    document.getElementById('current_province').value = user.current_province;
                    document.getElementById('current_city').value = user.current_city;
                    document.getElementById('current_baranggay').value = user.current_baranggay;

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
            current_baranggay: document.getElementById('current_baranggay').value,
            created_at: document.getElementById('created_at').value,
            updated_at: document.getElementById('updated_at').value,
        };

        fetch(`http://localhost:3000/users/${userId}`, {
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
                body: formData2,
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
                    updatedUser.image = data.url;

                    sendEditRequest(updatedUser);
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        } else {
            sendEditRequest(updatedUser);
        }

    });

    function sendEditRequest(updatedUser) {
        const userId = updatedUser.id;
        fetch(`http://localhost:3000/users/${userId}`, {
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

    fetch('http://localhost:3000/itinerary_favorites')
        .then(response => response.json())
        .then(data => {
            const favoritePlaceIds = data.map(item => item.place_id);
            selectedUserId = data[0]?.user_id;

            fetch('http://localhost:3000/places')
                .then(response => response.json())
                .then(placesData => {

                    if (Array.isArray(favoritePlaceIds)) {
                        placesData.forEach(place => {
                            if (favoritePlaceIds.includes(place.id)) {
                                const box = createBox(place);
                                boxContainer.appendChild(box);
                            }
                        });
                    } else {
                        console.error('Invalid favoritePlaceIds data:', favoritePlaceIds);
                    }
                })
                .catch(error => {
                    console.error('Error fetching places data:', error);
                });
        })
        .catch(error => {
            console.error('Error fetching favorites data:', error);
        });


    function createBox(place) {
        const box = document.createElement('div');
        box.id = `box-${place.id}`;
        const completedButton = document.createElement('completed-button');
        completedButton.className = 'completed-button';
        completedButton.setAttribute('data-toggle', 'modal');
        completedButton.setAttribute('data-target', '#ratingModal');
        completedButton.setAttribute('data-place-id', place.id); // Add this line
        completedButton.innerHTML = `
        <span class="material-icons">check_circle</span> Completed
    `;

        box.classList.add('box');
        box.innerHTML = `
      <div class="image">
        <img src="${place.image}" alt="">
        <span class="heart-icon">
          <i class="fas fa-heart"></i>
        </span>
      </div>
      <div class="content">
        <h3>${place.title}</h3>
        <p>${place.description}</p>
        <div class="button-container">
        <button class="completed-button" data-toggle="modal" data-target="#ratingModal" data-place-id="${place.id}">
            <span class="material-icons">check_circle</span> Completed
        </button>
        <button class="delete-button" data-place-id="${place.id}">
            <span class="material-icons">delete</span>
        </button>
        </div>
      </div>
    `;

        return box;

    }

    boxContainer.addEventListener('click', (event) => {
        const completedButton = event.target.closest('.completed-button');
        const deleteButton = event.target.closest('.delete-button');

        if (completedButton) {
            ratingModal.show();
            selectedPlaceId = completedButton.getAttribute('data-place-id');
            console.log('Selected Place ID:', selectedPlaceId);
        } else if (deleteButton) {
            selectedPlaceId = deleteButton.getAttribute('data-place-id');
            console.log('Deleting Place ID:', selectedPlaceId);

            // Perform delete action
            const boxToRemove = document.getElementById(`box-${selectedPlaceId}`);
            if (boxToRemove) {
                boxToRemove.remove();
            }

            // Send DELETE request to remove from favorites on the server
            fetch(`http://localhost:3000/itinerary_favorites/${selectedPlaceId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        console.error('Failed to remove from favorites:', response.statusText);
                    }
                })
                .catch(error => {
                    console.error('Error removing from favorites:', error);
                });

            // Reset selectedPlaceId
            selectedPlaceId = null;
        } else {
            selectedPlaceId = null; // Reset the selectedPlaceId if not clicking a button
        }
    });

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            updateStarsRating(rating);
        });
    });

    saveRatingButton.addEventListener('click', (event) => {
        // Your existing logic to collect the data
        const placeId = selectedPlaceId;
        const userId = selectedUserId;
        const rating = document.getElementById('rating').value;
        const comment = document.getElementById('comment').value;

        // Prepare the data for the POST request
        const requestData = {
            place_id: placeId,
            user_id: userId,
            ratings: rating,
            comment: comment,
            created_at: getCurrentDate(),
            updated_at: getCurrentDate(),
        };

        // POST the rating and comment to the server
        fetch('http://localhost:3000/itinerary_visited', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData) // Convert to JSON string
        })
            .then(response => {
                if (response.ok) {
                    alert('Added to feedback successfully');

                    // Remove the box from the DOM
                    const boxToRemove = document.getElementById(`box-${placeId}`);
                    if (boxToRemove) {
                        boxToRemove.remove();
                    }

                    // Remove from favorites on the server
                    fetch(`http://localhost:3000/itinerary_favorites/${placeId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(response => {
                            if (!response.ok) {
                                console.error('Failed to remove from favorites:', response.statusText);
                            }
                        })
                        .catch(error => {
                            console.error('Error removing from favorites:', error);
                        });

                    // Close the modal
                    ratingModal.hide();
                } else {
                    alert('Failed to add to feedback');
                }
            })
            .catch(error => {
                alert('Error adding to feedback: ' + error);
            });



    });


    function getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    }


    function updateStarsRating(rating) {
        document.getElementById('rating').value = rating;
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            const starRating = star.getAttribute('data-rating');
            star.innerHTML = starRating <= rating ? '&#9733;' : '&#9734;';
        });
    }
});

// USER PROFILE
// Function to fetch user data
function fetchUserData(userId) {
    return fetch(`http://localhost:3000/users/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching user data: ${response.status}`);
            }
            return response.json();
        });
}

// Function to fetch preference data
function fetchPreferenceData() {
    return fetch('http://localhost:3000/preference')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching preference data: ${response.status}`);
            }
            return response.json();
        });
}

// Function to update the user profile
function updateProfile() {
    const isLoggedIn = localStorage.getItem('access_token') !== null;
    const userData = JSON.parse(localStorage.getItem('user_data'));

    // Fetch user data
    fetchUserData(userData.id)
        .then(user => {
            fetchPreferenceData()
                .then(preferenceData => {
                    const userPreferences = preferenceData.find(preference => preference.user_id === user.id);

                    if (userPreferences && userPreferences.preferences && userPreferences.preferences.length > 0) {
                        populateUserData(user, userPreferences.preferences);
                    } else {
                        console.error('User preferences not found in data.');
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

function populateUserData(user, preferences) {
    const nameHolder = document.querySelector(".nameHolder");
    if (nameHolder) {
        nameHolder.textContent = `${user.first_name} ${user.last_name}`;
    } else {
        console.error("nameHolder element not found.");
    }

    const profileImg = document.querySelector(".profile-img img");
    if (profileImg) {
        profileImg.src = user.image;
    } else {
        console.error("profile-img img element not found.");
    }

    const preferencesElement = document.querySelector(".profile-work");
    if (preferencesElement) {

        preferencesElement.innerHTML = "";


        if (preferences && preferences.length > 0) {
            const preferenceTitle = document.createElement("p");
            preferenceTitle.textContent = "Preferences:";
            preferencesElement.appendChild(preferenceTitle);


            const preferenceList = document.createElement("ul");

            preferences.forEach((preference) => {
                const preferenceItem = document.createElement("li");
                preferenceItem.textContent = preference.category;
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
            { label: "Baranggay:", value: user.current_baranggay },
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



