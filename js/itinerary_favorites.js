document.addEventListener("DOMContentLoaded", function () {
  const favoritesButton = document.getElementById("favoritesButton");
  const visitedButton = document.getElementById("visitedButton");
  const accountButton = document.getElementById("accountButton");
  const builderButton = document.getElementById("builderButton");
  const completedButtons = document.querySelectorAll('.completed-button');
  const ratingModal = new bootstrap.Modal(document.getElementById('ratingModal'));
  const saveRatingButton = document.getElementById('saveRating');
  const stars = document.querySelectorAll('.star');
  const boxContainer = document.querySelector('.box-container');
  let selectedPlaceId;
  let selectedUserId;
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    // Redirect to the login page
    window.location.href = 'login_register.php';
    return; // Stop executing further code
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
  builderButton.addEventListener("click", function () {
    window.location.href = "itinerary-builder.php";
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

  const isLoggedIn = localStorage.getItem('access_token') !== null;

  if (isLoggedIn) {
    function parseJwt(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  
      return JSON.parse(jsonPayload);
    }
    const access_token = localStorage.getItem('access_token');

    selectedUserId = parseJwt(access_token);
    
    if (selectedUserId !== null) {
      fetch(`${API_PROTOCOL}://${API_HOSTNAME}/itineraries/items/` , {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}` 
        }
       })
        .then(response => response.json())
        .then(data => {
          const placesData = data; 

          if (Array.isArray(placesData)) {
            placesData.forEach(place => {
             
              fetchPlaceDataById(place.id)
              .then(placeData => {
                if (placeData.id === place.id) {
                  place.place_id = placeData.place_id;
                }

                  fetchFeedbackDataByUserIdAndPlaceId(selectedUserId.id, placeData.place_id)
                  .then(hasFeedback => {
                    place.disable_button = hasFeedback;
                    
                    const box = createBox(place);
                    boxContainer.appendChild(box);
                  })
                  .catch(error => {
                    console.error("Error fetching feedback data:", error);
                  });
              })
              .catch(error => {
                console.error("Error fetching additional data:", error);
              });
            });
          } else {
            console.error('Invalid placesData:', placesData);
          }
        });
    } else {
      console.error('User ID is missing or invalid.');
    }
  } else {
    console.error('User is not logged in.');
  }
  

  function createBox(place) {
    const box = document.createElement('div');
    box.id = `box-${place.id}`;
    const addToFavoritesButton = document.createElement('button');
    addToFavoritesButton.className = 'add-to-favorites-button';
    addToFavoritesButton.textContent = 'Add to Favorites';
    addToFavoritesButton.addEventListener('click', () => {
      addToFavorites(place.id);
    });
    var disabled = "";
    if (place.disable_button == true) {
      disabled = "disabled";
    }
  
    box.classList.add('box');
    box.innerHTML = `
      <div class="image">
        <img src="${place.photos[0]}" alt="">
        <span class="heart-icon">
          <i class="fas fa-heart"></i>
        </span>
      </div>
      <div class="content">
        <h3>${place.title}</h3>
        <p>${place.description}</p>
        <div class="button-container">
          <button class="completed-button ${disabled}" data-toggle="modal" data-target="#ratingModal" ${disabled} data-place-id="${place.place_id}">
            <span class="material-icons">check_circle</span> Completed
          </button>
          <button class="delete-button" data-favorites-id="${place.id}">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
    `;

    // Add event listener for the delete button
  const deleteButton = box.querySelector('.delete-button');
  deleteButton.addEventListener('click', () => {
    showConfirmationModal(place.id);
  });
  
    return box;
  }

  function showConfirmationModal(placeId) {
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const cancelDeleteButton = document.getElementById('cancelDeleteButton');
  
    // Set the placeId as a data attribute of the modal
    confirmationModal.setAttribute('data-place-id', placeId);
  
    // Show the modal
    confirmationModal.style.display = 'block';
  
    // Add event listener for the confirm delete button
    confirmDeleteButton.addEventListener('click', () => {
      const placeIdToDelete = confirmationModal.getAttribute('data-place-id');
      deleteBoxAndData(placeIdToDelete);
      // Close the modal after confirming delete
      confirmationModal.style.display = 'none';
    });
  
    // Add event listener for the cancel button to close the modal
    cancelDeleteButton.addEventListener('click', () => {
      confirmationModal.style.display = 'none';
    });
  }

  function deleteBoxAndData(placeIdToDelete) {
    const boxToRemove = document.getElementById(`box-${placeIdToDelete}`);
    if (boxToRemove) {
      boxToRemove.remove();
    }
  
    // Perform delete action
    const accessToken = localStorage.getItem('access_token');
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/itineraries/item/${placeIdToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          console.error('Failed to remove from favorites:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error removing from favorites:', error);
      });
  }
  

  function addToFavorites(placeId) {

    const requestData = {
      place_id: placeId,
      user_id: selectedUserId,
      created_at: getCurrentDate(),
      updated_at: getCurrentDate(),
    };

    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/itinerary_favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (response.ok) {
          alert('Added to favorites successfully');
        } else {
          alert('Failed to add to favorites');
        }
      })
      .catch((error) => {
        alert('Error adding to favorites: ' + error);
      });
  }

  boxContainer.addEventListener('click', (event) => {
    const completedButton = event.target.closest('.completed-button');
  
    if (completedButton) {
      ratingModal.show();
      selectedPlaceId = completedButton.getAttribute('data-place-id');
    }
  });
  

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = star.getAttribute('data-rating');
      updateStarsRating(rating);
    });
  });

  saveRatingButton.addEventListener('click', (event) => {

    const placeId = selectedPlaceId;
    const userId = selectedUserId;
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;

    const requestData = {
      place_id: placeId,
      rating: parseInt(rating),
      comment: comment,

    };
    const accessToken = localStorage.getItem('access_token');
    // POST the rating and comment to the server
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/feedbacks/user/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestData),
    })
      .then(response => {
        if (response.ok) {
          alert('Added to feedback successfully');

          // // Remove the box from the DOM
          // const boxToRemove = document.getElementById(`box-${placeId}`);
          // if (boxToRemove) {
          //   boxToRemove.remove();
          // }

          // // Remove from favorites on the server
          // fetch(`${API_PROTOCOL}://${API_HOSTNAME}/itinerary_favorites/${placeId}`, {
          //   method: 'DELETE',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          // })
          //   .then(response => {
          //     if (!response.ok) {
          //       console.error('Failed to remove from favorites:', response.statusText);
          //     }
          //   })
          //   .catch(error => {
          //     console.error('Error removing from favorites:', error);
          //   });

          // Close the modal
          ratingModal.hide();
          window.location.reload();
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

function fetchPlaceDataById(placeId) {
  const accessToken = localStorage.getItem('access_token');
  return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/itineraries/item/${placeId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => response.json());
}

function fetchFeedbackDataByUserIdAndPlaceId(userId, placeId) {
  const accessToken = localStorage.getItem('access_token');
  return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/feedbacks/user/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(feedbackData => {
    if (!Array.isArray(feedbackData)) {
      throw new Error('Feedback data is not an array');
    }

    const matchingFeedback = feedbackData.find(feedback => feedback.place_id === placeId);
    return !!matchingFeedback; 
  })
  .catch(error => {
    console.error('Error fetching feedback data:', error);
    return false; 
  });
}
});
