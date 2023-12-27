
document.addEventListener("DOMContentLoaded", function () {
    async function fetchRating(desiredPlaceId) {
        const apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/feedbacks/place/${desiredPlaceId}`;

        try {
            const response = await fetch(apiUrl);

            if (response.ok) {
                const data = await response.json();

                if (data && typeof data.avg !== 'undefined') {
                    const rating = data.avg;
                    const starsHTML = generateStarsHTML(rating);
                    document.getElementById("total-rating").innerHTML = starsHTML;
                } else {
                    console.error("API response is missing expected data");
                }
            } else {
                console.error(`Failed to fetch data from the API. Status: ${response.status}`);
                const errorMessage = await response.text();
                console.error("Error message:", errorMessage);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Function to generate HTML for stars based on the rating
    function generateStarsHTML(rating) {
        let starsHTML = '';

        for (let i = 0; i < rating; i++) {
            if (i % 1 === 0) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else {
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            }
        }

        return starsHTML;
    }

    const filterButtons = document.querySelectorAll(".filter-nav button");
    const commentCardsContainer = document.querySelector(".comment-cards-container");
    const addToFavoritesBtn = document.getElementById("add-to-favorites");
    const queryParams = new URLSearchParams(window.location.search);
    const desiredServiceId = queryParams.get("id");

    // ADD to visited
    addVisited(desiredServiceId);

    //    const isServiceFavorited = localStorage.getItem("favoriteService_" + desiredServiceId);
    const favoritesListPromise = fetchFavorites();
    favoritesListPromise
        .then(favoritesList => {
            // Use Promise.all to handle multiple asynchronous calls
            const checkingResultsPromises = favoritesList.map(item =>
                checkIfcurrentPlaceisFavorite(item)
            );

            return Promise.all(checkingResultsPromises);
        })
        .then(checkingResults => {
            const isAnyFavorite = checkingResults.some(isFavorite => isFavorite);
            if (isAnyFavorite) {
                addToFavoritesBtn.classList.add("added");
                addToFavoritesBtn.innerHTML = '<i class="fas fa-check"></i> Added to Favorites';
            } else {

            }


        })
        .catch(error => {
            console.error("Error fetching favorites: " + error);
        });

    const isServiceFavorited = false;

    let commentCards = document.querySelectorAll(".comment-card");

    function updateCommentCards() {
        commentCards = document.querySelectorAll(".comment-card");
    }

    const isLoggedIn = localStorage.getItem('access_token') !== null;

    if (isLoggedIn) {
        addToFavoritesBtn.style.visibility = "visible";
    } else {
        addToFavoritesBtn.style.visibility = "hidden";
    }

    let addItemCounter = 1;
    let deleteItemCounter = 1;

    function parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    addToFavoritesBtn.addEventListener("click", function () {
        addToFavoritesBtn.classList.toggle("added");
        const accessToken = getAccessTokenFromLocalStorage();
        const user_id = parseJwt(accessToken);
        if (addToFavoritesBtn.classList.contains("added")) {
            addToFavoritesBtn.innerHTML = '<i class="fas fa-check"></i> Added to Favorites';

            addItemCounter++;

            const favoriteData = {
                place_id: desiredServiceId,
                user_id: user_id.id,
            };

            // Add the service to favorites
            fetch(`${API_PROTOCOL}://${API_HOSTNAME}/itineraries/item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(favoriteData)
            })
                .then(response => {
                    if (response.ok) {
                        alert('Added to favorites successfully');
                    } else {
                        alert('Failed to add to favorites');
                    }
                })
                .catch(error => {
                    alert('Error adding to favorites: ' + error);
                });
        } else {
            // Use the counter for deleting items
            const deleteItemId = deleteItemCounter;
            deleteItemCounter++;
            var favoritesID = addToFavoritesBtn.getAttribute("favorite-id");
            // Remove the service from favorites
            fetch(`${API_PROTOCOL}://${API_HOSTNAME}/itineraries/item/${favoritesID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    if (response.ok) {
                        addToFavoritesBtn.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
                        localStorage.removeItem("favoriteService_" + desiredServiceId);
                        alert('Removed from favorites successfully');
                    } else {
                        return response.json();
                    }
                })
                .then(data => {
                    if (data && data.error) {
                        alert('Failed to remove from favorites: ' + data.error);
                    }
                })
                .catch(error => {
                    alert('Error removing from favorites: ' + error);
                });
        }
    });

    function getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    }

    const comments = [];

    function calculateTotalRating(placeComments) {
        if (placeComments.length === 0) {
            return;
        }

        const totalRating = placeComments.reduce((acc, comment) => acc + parseFloat(comment.rating), 0);

        const averageRating = totalRating / placeComments.length;

        const roundedAverage = Math.round(averageRating * 10) / 10;

        const starsHTML = generateStars(roundedAverage);
        // document.getElementById("total-rating").innerHTML = starsHTML;

        document.getElementById("number-of-visits").textContent = `${placeComments.length} visits`;
    }


    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating - fullStars >= 0.5;
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push('<i class="fas fa-star"></i>');
        }

        if (halfStar) {
            stars.push('<i class="fas fa-star-half-alt"></i>');
        }

        return stars.join("");
    }


    function initializeImageGallery(imageUrls) {

        const galleryContainer = document.getElementById('dynamic-gallery');

        // Check if there is only one image
        if (imageUrls.length === 1) {
            // Hide the image gallery section
            const imageGallerySection = document.querySelector('.image-gallery');
            imageGallerySection.style.display = 'none';
            return;
        }

        galleryContainer.innerHTML = '';

        imageUrls.slice(1, 5).forEach((imageUrl, index) => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-xs-6 thumb';

            const link = document.createElement('a');
            link.href = imageUrl;
            link.classList.add('image-popup');

            const figure = document.createElement('figure');

            const image = document.createElement('img');
            image.className = 'img-fluid img-thumbnail';
            image.src = imageUrl;
            image.alt = `Image ${index + 1}`;

            image.style.width = '250px';
            image.style.height = '200px';
            image.style.objectFit = 'cover';

            figure.appendChild(image);
            link.appendChild(figure);
            col.appendChild(link);

            galleryContainer.appendChild(col);

        });

        $(".gallery").magnificPopup({
            delegate: "a",
            type: "image",
            tLoading: "Loading image #%curr%...",
            mainClass: "mfp-img-mobile",
            gallery: {
                enabled: true,
                navigateByImgClick: true,
                preload: [0, 1]
            },
            image: {
                tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
            }
        });
    }


    async function processData() {
        try {
            const queryParams = new URLSearchParams(window.location.search);
            const desiredPlaceId = queryParams.get("id");
            const desiredService = dynamicData.find((service) => service.id === desiredPlaceId);

            if (!desiredService) {
                console.error("Service not found for ID:", desiredPlaceId);
                return;
            }

            fetchRating(desiredPlaceId);

            const backgroundElement = document.querySelector(".background-image");
            const titleElement = document.querySelector("h3");
            const paragraphElement = document.querySelector(".dynamic-paragraph");

            let imageUrl = "";
            if (Array.isArray(desiredService.photos) && desiredService.photos.length > 0) {
                const firstImageArray = desiredService.photos[0];
                if (Array.isArray(firstImageArray) && firstImageArray.length > 0) {
                    imageUrl = firstImageArray[0];
                }
            }
            backgroundElement.style.backgroundImage = `url("${imageUrl}")`;
            titleElement.textContent = desiredService.title;
            paragraphElement.textContent = desiredService.description;

            backgroundElement.style.cursor = 'pointer';
            backgroundElement.addEventListener('click', (event) => {
                event.preventDefault();
                openBackgroundImage(imageUrl);
            });

            function openBackgroundImage(imageUrl) {
                if (imageUrl) {
                    $.magnificPopup.open({
                        items: {
                            src: imageUrl
                        },
                        type: 'image',
                        gallery: {
                            enabled: false
                        },
                        mainClass: 'mfp-img-mobile',
                        image: {
                            tError: '<a href="%url%">The image could not be loaded.</a>'
                        }
                    });
                } else {
                    console.error('Background image URL is empty.');
                }
            }

            initializeImageGallery(desiredService.photos[0]);
            // Function to calculate relative time
            function calculateRelativeTime(created_at) {
                const currentDate = new Date();
                const commentDate = new Date(created_at);
                const timeDifference = currentDate - commentDate;

                // Convert milliseconds to seconds
                const seconds = Math.floor(timeDifference / 1000);

                // Calculate relative time
                if (seconds < 60) {
                    return seconds + ' seconds ago';
                } else if (seconds < 3600) {
                    const minutes = Math.floor(seconds / 60);
                    return minutes + ' minutes ago';
                } else if (seconds < 86400) {
                    const hours = Math.floor(seconds / 3600);
                    return hours + ' hours ago';
                } else {
                    const days = Math.floor(seconds / 86400);
                    return days + ' days ago';
                }
            }

            try {
                const commentsResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/feedbacks/place/${desiredPlaceId}`);
                if (!commentsResponse.ok) {
                    throw Error(`Error fetching comments: ${commentsResponse.status} ${commentsResponse.statusText}`);
                }

                const commentsData = await commentsResponse.json();

                console.log('Fetched comments:', commentsData);

                const placeComments = commentsData.all;
                calculateTotalRating(placeComments);

                const commentCardsContainer = document.getElementById('commentCardsContainer');

                if (placeComments.length === 0) {
                    const noCommentsMessage = document.createElement("p");
                    noCommentsMessage.classList.add("no-comments-message");
                    noCommentsMessage.textContent = "This place has no feedback from users yet.";
                    commentCardsContainer.appendChild(noCommentsMessage);
                } else {
                    for (const comment of placeComments) {
                        const replies = await fetchReplies(comment.id);
                        const repliesHtml = replies.map((reply) => `
                            <div class="reply-container">
                                <div class="reply-user-info">
                                    <img src="${reply.profile_photo}" alt="Profile Photo" class="profile-photo-reply">
                                    <div class="user-details">
                                        <p class="user-fullname-reply">${reply.first_name} ${reply.last_name}</p>
                                        <p class="user-created-reply">${calculateRelativeTime(reply.created_at)}</p>
                                    </div>
                                </div>
                                <p class="reply-text" style="margin-left: 20px;">${reply.reply_comment}</p>
                            </div>
                        `).join('');

                        const repliesContainer = document.createElement('div');
                        repliesContainer.classList.add('replies-container');
                        repliesContainer.classList.add('replies-section'); // Add the 'replies-section' class
                        repliesContainer.innerHTML = repliesHtml;

                        const commentCard = document.createElement("div");
                        commentCard.classList.add("comment-card");
                        commentCard.setAttribute("data-rating", comment.rating);
                        commentCard.classList.add(`rating-${comment.rating}`);

                        const fullName = `${comment.first_name} ${comment.last_name}` || "Anonymous";

                        let profilePhotoComment = comment.profile_photo ? `<img src="${comment.profile_photo}" alt="Profile Photo">` : "";
                        if (!profilePhotoComment) {
                            if (comment.gender === "male") {
                                profilePhotoComment = `<img src="image/male.png" alt="Male Profile Photo">`;
                            } else if (comment.gender === "female") {
                                profilePhotoComment = `<img src="image/female.png" alt="Female Profile Photo">`;
                            }
                        }

                        const location = `${comment.current_city}, ${comment.current_province}, ${comment.from_country}` || "";

                        commentCard.innerHTML = `
                            <div class="comment-content">
                                <div class="user-info">
                                    <div class="profile-photo">
                                        ${profilePhotoComment}
                                    </div>
                                    <div class="user-details">
                                        <p class="user-fullname">${fullName}</p>
                                        <p class="user-location">${location}</p>
                                    </div>
                                </div>
                                <div class="rating">
                                    <p class="comment-text">Rate: ${generateStars(comment.rating)} <span class="comment-date"> • ${calculateRelativeTime(comment.created_at)}</span></p>
                                </div>
                                <p class="comment-text">Comment: ${comment.comment}</p>
                                <p class="replies-link" style="font-size: 14px; margin-top: 20px; margin-left: 20px; border-top: 1px solid #ccc; padding: 5px; cursor: pointer;">
                                    Replies: (${replies.length}) <i class="fas fa-reply reply-icon"></i>  
                                </p>
                                <div class="replies-section"> <!-- Add this container for the replies -->
                                    ${repliesHtml}
                                </div>
                                <button class="reply-button" data-comment-id="${comment.id}">Reply</button>
                                <div class="reply-form-container" style="display: none;">
                                    <form class="reply-form">
                                        <textarea class="reply-textarea" placeholder="Type your reply here..."></textarea>
                                        <button type="submit" class="send-reply-button">Send</button>
                                    </form>
                                </div>
                            </div>
                        `;

                        // Add styles for the hover effect
                        const repliesLink = commentCard.querySelector('.replies-link');
                        repliesLink.style.color = '#333';
                        repliesLink.addEventListener('mouseenter', () => {
                            repliesLink.style.color = '#4CAF50';
                        });
                        repliesLink.addEventListener('mouseleave', () => {
                            repliesLink.style.color = '#333';
                        });
                        const repliesSection = commentCard.querySelector('.replies-section');
                        repliesLink.addEventListener('click', () => {
                            repliesSection.style.display = repliesSection.style.display === 'block' ? 'none' : 'block';
                        });

                        commentCardsContainer.appendChild(commentCard);

                        const replyButton = commentCard.querySelector('.reply-button');
                        replyButton.style.backgroundColor = '#4CAF50';
                        replyButton.style.color = 'white';
                        replyButton.style.border = 'none';
                        replyButton.style.borderRadius = '5px';
                        replyButton.style.cursor = 'pointer';
                        replyButton.style.width = '70px';
                        replyButton.style.height = '30px';
                        replyButton.style.marginLeft = '20px';
                        replyButton.style.fontSize = '12px';

                        const replyFormContainer = commentCard.querySelector('.reply-form-container');
                        replyButton.addEventListener('click', () => {
                            const commentId = replyButton.getAttribute('data-comment-id');
                            console.log('Clicked Reply for Comment ID:', commentId);
                            replyFormContainer.style.display = replyFormContainer.style.display === 'block' ? 'none' : 'block';
                        });

                        const replyTextarea = commentCard.querySelector('.reply-textarea');
                        replyTextarea.style.width = '90%';
                        replyTextarea.style.padding = '3px';
                        replyTextarea.style.marginTop = '10px';
                        replyTextarea.style.boxSizing = 'border-box';
                        replyTextarea.style.marginLeft = '20px';

                        const sendReplyButton = commentCard.querySelector('.send-reply-button');
                        sendReplyButton.style.backgroundColor = '#4CAF50';
                        sendReplyButton.style.color = 'white';
                        sendReplyButton.style.border = 'none';
                        sendReplyButton.style.borderRadius = '5px';
                        sendReplyButton.style.cursor = 'pointer';
                        sendReplyButton.style.marginTop = '10px';
                        sendReplyButton.style.marginLeft = '20px';
                        sendReplyButton.style.fontSize = '12px';
                        sendReplyButton.style.width = '70px';
                        sendReplyButton.style.height = '30px';

                        const replyForm = commentCard.querySelector('.reply-form');
                        replyForm.addEventListener('submit', async (event) => {
                            event.preventDefault();
                            const replyText = replyTextarea.value;
                            const commentId = replyButton.getAttribute('data-comment-id');
                            console.log('Clicked Reply for Comment ID:', commentId);
                            await sendReply(commentId, replyText);
                            replyTextarea.value = '';
                            replyFormContainer.style.display = 'none';
                            // Fetch and display updated replies
                            const updatedReplies = await fetchReplies(commentId);
                            const updatedRepliesHtml = updatedReplies.map((reply) => `<p class="reply-text">${reply.reply_comment}</p>`).join('');
                            repliesContainer.innerHTML = updatedRepliesHtml;
                            commentCard.querySelector('.replies').textContent = `Replies: ${updatedReplies.length}`;
                        });
                    }

                    updateCommentCards();
                }
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        } catch (error) {
            console.error("Error in processData:", error);
        }
    }

    async function sendReply(commentId, replyText) {
        const accessToken = localStorage.getItem('access_token');
        try {
            const replyData = {
                reply_comment: replyText,
            };

            const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/feedbacks/${commentId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(replyData),
            });

            if (!response.ok) {
                throw Error(`Error sending reply: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('Reply sent successfully:', responseData);

            // Reload the page after successful reply
            window.location.reload();
        } catch (error) {
            console.error('Error sending reply:', error);
        }
    }


    async function fetchReplies(commentId) {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/feedbacks/${commentId}/replies`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw Error(`Error fetching replies: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('Fetched replies PER COMMENT:', responseData);

            return responseData || [];
        } catch (error) {
            console.error('Error fetching replies:', error);
            return [];
        }
    }







    filterButtons.forEach(button => {
        button.addEventListener("click", function () {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const selectedRating = button.getAttribute("data-rating");

            const currentCommentCards = document.querySelectorAll(".comment-card");

            currentCommentCards.forEach(card => {
                const cardRating = card.getAttribute("data-rating");

                if (selectedRating === "all" || cardRating === selectedRating) {
                    card.classList.remove("none");
                } else {
                    card.classList.add("none");
                }
            });

        });
    });




    function fetchPlaceData(placeId) {
        const accessToken = getAccessTokenFromLocalStorage();
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
        };

        return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places/${placeId}`, { headers })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching place data: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(places => {
                // Log the fetched places
                console.log("Fetched place details: ", places);
                return places; // Return the places data if needed
            })
            .catch(error => {
                console.error("Error fetching place data:", error);
                return null;
            });
    }
   

    
    const dynamicData = [];

    function fetchServicesData() {
        const accessToken = getAccessTokenFromLocalStorage();
        const url = `${API_PROTOCOL}://${API_HOSTNAME}/places`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const mappedData = data.map(user => {
                    return {
                        id: user.id,
                        category: user.category,
                        title: user.title,
                        description: user.description,
                        photos: [user.photos],
                        website: user.social_links ? user.social_links.links : null,
                        contact: [user.contact]
                        // address: user.address,
                    };
                });

                dynamicData.push(...mappedData);
                processData();
            })
            .catch(error => console.error(error));
    }



    fetchServicesData();

    function getUserId() {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        if (userData && userData.id) {
            return userData.id;
        } else {
            console.error('User data is missing or incomplete in localStorage.');
            return null;
        }
    }
    function getAccessTokenFromLocalStorage() {
        const accessToken = localStorage.getItem('access_token');
        return accessToken;
    }


    function fetchFavorites() {
        const accessToken = getAccessTokenFromLocalStorage();
        return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/itineraries/items/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const copy = [];
                data.forEach(function (item) {
                    copy.push(item.id);
                });
                return copy;
            })
            .catch(error => {
                throw error;
            });
    }

    function checkIfcurrentPlaceisFavorite(favoritesID) {
        const accessToken = getAccessTokenFromLocalStorage();

        // Add the service to favorites
        return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/itineraries/item/${favoritesID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        })
            .then(response => {

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();

            }).then(data => {
                if (desiredServiceId == data.place_id) {
                    addToFavoritesBtn.setAttribute("favorite-id", data.id);
                    return true;
                } else {
                    return false;

                }

            })
            .catch(error => {
                alert('Error adding to favorites: ' + error);
            });
    }

    function addVisited(serviceId) {
        const accessToken = localStorage.getItem('access_token');
        // Return a Promise
        return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/visit-place/${serviceId}/user`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {

            })
            .catch(error => {
                throw error;
            });
    }

// EMERGENCY HOTLINES
fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go`)
  .then(response => response.json())
  .then(data => {
    console.log('All Where to go contents:', data);

    const ulNearbyPlaces = document.getElementById('ul-nearby-places');
    const nearbyPlacesContainer = document.getElementById('nearbyPlacesContainer');

    if (!ulNearbyPlaces || !nearbyPlacesContainer) {
      console.error('UL element or container not found.');
      return;
    }

    const desiredPlaceId = queryParams.get("id");

    // Fetch data for the desired place to get its city
    fetchPlaceData(desiredPlaceId)
      .then(desiredPlaceData => {
        if (!desiredPlaceData) {
          console.error('Error fetching data for the desired place.');
          return;
        }
        console.log('Desired Place ID:', desiredPlaceId);
        console.log('Desired Place Data:', desiredPlaceData);

        const desiredCity = desiredPlaceData.city;

        const filteredPlaces = data.filter(place => place.title === desiredCity);

        if (filteredPlaces.length === 0 || !filteredPlaces[0].hotlines) {
          // If no hotlines or hotlines is null, hide the container
          nearbyPlacesContainer.style.display = 'none';
          return;
        }

        filteredPlaces.forEach(place => {
          const li = document.createElement('li');
          li.className = 'li-nearby-places';
          const divRow = document.createElement('div');
          divRow.className = 'row';

          const divContent = document.createElement('div');
          divContent.className = 'col-md-12';

          // Assuming hotlines is an object with key-value pairs
          Object.entries(place.hotlines).forEach(([key, value]) => {
            divContent.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
          });

          divRow.appendChild(divContent);

          li.appendChild(divRow);

          ulNearbyPlaces.appendChild(li);
        });
      })
      .catch(error => console.error('Error fetching data for the desired place:', error));
  })
  .catch(error => console.error('Error fetching data:', error));



});

const categoryToIcon = {
    'swim and beaches': 'fas fa-water',
    'nature trip': 'fas fa-leaf',
    'tourist spots': 'fas fa-location-dot',
    'hotel': 'fas fa-hotel',
    'churches': 'fas fa-church',
    'events': 'fas fa-calendar-days',
  
  };
  
  const carousel = document.querySelector('.carousel');
  
  async function fetchAndGenerateCards(url, isFestival = false, city) {
    console.log('Function called');
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${isFestival ? 'festival' : 'card'} data`);
      }
  
      const cardData = await response.json();
  
      if (cardData.length === 0) {
  
        const noDataText = document.createElement('p');
        noDataText.textContent = 'THERE IS NO RELEVANT PLACES/EVENTS TO SHOW';
        noDataText.className = 'no-data-text';
        carousel.appendChild(noDataText);
        return;
      }
  
      let firstCardWidth = 0; 
  
      cardData.forEach(card => {
        if (card.city.toLowerCase() === city.toLowerCase()) {
          const cardElement = document.createElement('li');
          cardElement.className = 'card';
      
          const imageUrl = Array.isArray(card.images) && card.images.length > 0
            ? card.images[0]
            : Array.isArray(card.photos) && card.photos.length > 0
              ? card.photos[0]
              : '';
      
          cardElement.style.backgroundImage = `url('${imageUrl}')`;
          cardElement.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      
          const iconClass = isFestival ? 'fas fa-calendar-days' : categoryToIcon[card.category];
      
          const modifiedCity = card.city.toLowerCase().includes('city') ? card.city : `${card.city} City`;
      
          cardElement.innerHTML = `
            <div class="icon card-icon ${iconClass}"></div>
            <h2>${card.title}</h2>
            <span> ${modifiedCity}, ${card.province}</span>
          `;
      
          if (isFestival) {
            const redirectUrl = card.id ? `festival_content.php?item_id=${card.id}` : '#';
            cardElement.dataset.redirectUrl = redirectUrl;
          } else {
            const redirectUrl = card.id ? `wheretogo-content.php?id=${card.id}` : '#';
            cardElement.dataset.redirectUrl = redirectUrl;
          }
      
          cardElement.addEventListener('click', () => {
            const redirectUrl = cardElement.dataset.redirectUrl;
            console.log('Redirect URL:', redirectUrl);
            if (redirectUrl && redirectUrl !== '#') {
              window.top.location.href = redirectUrl;
            }
          });
      
          carousel.appendChild(cardElement);
        }
      });
      
      
  
      // Get the first card's width if there are cards
      const firstCard = carousel.querySelector('.card');
      if (firstCard) {
        firstCardWidth = firstCard.offsetWidth;
      }
  
      const wrapper = document.querySelector('.wrapper');
      let isDragging = false,
        isAutoPlay = true,
        startX,
        startScrollLeft,
        timeoutId;
  
      carousel.addEventListener('mousedown', dragStart);
      carousel.addEventListener('mousemove', dragging);
      document.addEventListener('mouseup', dragStop);
      carousel.addEventListener('scroll', infiniteScroll);
      wrapper.addEventListener('mouseenter', () => clearTimeout(timeoutId));
      wrapper.addEventListener('mouseleave', autoPlay);
  
      const arrowBtns = document.querySelectorAll('.wrapper i');
      arrowBtns.forEach(btn => {
        btn.addEventListener('click', () => handleArrowButtonClick(btn));
      });
  
      function handleArrowButtonClick(btn) {
        carousel.scrollLeft += btn.id === 'left' ? -firstCardWidth : firstCardWidth;
      }
  
      function dragStart(e) {
        isDragging = true;
        carousel.classList.add('dragging');
        startX = e.pageX;
        startScrollLeft = carousel.scrollLeft;
      }
  
      function dragging(e) {
        if (!isDragging) return;
        carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
      }
  
      function dragStop() {
        isDragging = false;
        carousel.classList.remove('dragging');
      }
  
      function infiniteScroll() {
        if (carousel.scrollLeft === 0) {
  
        } else if (Math.ceil(carousel.scrollLeft) === carousel.scrollWidth - carousel.offsetWidth) {
  
        }
        clearTimeout(timeoutId);
        if (!wrapper.matches(':hover')) autoPlay();
      }
  
      function autoPlay() {
        if (window.innerWidth < 800 || !isAutoPlay) return;
        timeoutId = setTimeout(() => carousel.scrollLeft += firstCardWidth, 2500);
      }
  
      autoPlay();
    } catch (error) {
      console.error(`Error fetching ${isFestival ? 'festival' : 'card'} data:`, error);
    }
  }
  
  async function fetchAndGenerateCardsForCity(city) {
    try {
      const festivalUrl = `${API_PROTOCOL}://${API_HOSTNAME}/events`;
      const placesUrl = `${API_PROTOCOL}://${API_HOSTNAME}/places`;
  
      carousel.innerHTML = '';
  
      await Promise.all([
        fetchAndGenerateCards(festivalUrl, true, city),
        fetchAndGenerateCards(placesUrl, false, city)
      ]);
  
      if (carousel.childElementCount === 0) {
        const noDataTextContainer = document.createElement('div');
        noDataTextContainer.className = 'no-data-container';
        const noDataText = document.createElement('p');
        noDataText.textContent = 'There is no relevant events/places to show.';
        noDataText.className = 'no-data-text';
        noDataTextContainer.appendChild(noDataText);
        carousel.appendChild(noDataTextContainer);
      }
  
    } catch (error) {
      console.error('Error fetching city data or cards data:', error);
    }
  }
  
  
  function refreshContent() {
    const clickedTitle = localStorage.getItem('clickedTitle') || 'DefaultCity';
    fetchAndGenerateCardsForCity(clickedTitle);
  }
  
  window.addEventListener('load', refreshContent);
  
  window.addEventListener('storage', event => {
    if (event.key === 'clickedTitle') {
      refreshContent();
    }
  });
  
  const cityOptions = document.querySelectorAll('.city-option');
  
  cityOptions.forEach(option => {
    option.addEventListener('click', () => {
      const selectedCity = localStorage.getItem('selectedCity') || 'DefaultCity';
      carousel.innerHTML = '';
      fetchAndGenerateCardsForCity(selectedCity);
      refreshContent();
    });
  });
  
