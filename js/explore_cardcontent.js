
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
                        const repliesHtml = replies.map((reply) => {
                            // Set profile photo for reply comment
                            let profilePhotoReply = reply.profile_photo ? `<img src="${reply.profile_photo}" alt="Profile Photo" class="profile-photo-reply">` : "";
                            if (!profilePhotoReply) {
                                if (reply.gender === "male") {
                                    profilePhotoReply = `<img src="image/male.png" alt="Male Profile Photo" class="profile-photo-reply">`;
                                } else if (reply.gender === "female") {
                                    profilePhotoReply = `<img src="image/female.png" alt="Female Profile Photo" class="profile-photo-reply">`;
                                }
                            }
                        
                            return `
                                <div class="reply-container">
                                    <div class="reply-user-info">
                                        ${profilePhotoReply}
                                        <div class="user-details">
                                            <p class="user-fullname-reply">${reply.first_name} ${reply.last_name}</p>
                                            <p class="user-created-reply">${calculateRelativeTime(reply.created_at)}</p>
                                        </div>
                                    </div>
                                    <p class="reply-text" style="margin-left: 20px;">${reply.reply_comment}</p>
                                </div>
                            `;
                        }).join('');

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
    
        if (!accessToken) {
            alert("Login/Register your account first to reply to this comment.");
            return;
        }
    
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
// Function to fetch places from the API and load them on the map
async function loadPlacesOnMap() {
    try {
        const desiredPlaceId = queryParams.get("id");

        const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);

        if (fetchedPlaceData && fetchedPlaceData.latitude && fetchedPlaceData.longitude) {
            const map = L.map('map').setView([fetchedPlaceData.latitude, fetchedPlaceData.longitude], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            const marker = L.marker([fetchedPlaceData.latitude, fetchedPlaceData.longitude]).addTo(map);

            // Create a link to open Google Maps with the specified latitude and longitude
            const googleMapsLink = document.createElement('a');
            googleMapsLink.href = `https://www.google.com/maps?q=${fetchedPlaceData.latitude},${fetchedPlaceData.longitude}`;
            googleMapsLink.target = '_blank';
            googleMapsLink.textContent = 'See directions in Google Maps';

            // Add the link to the marker's popup
            marker.bindPopup(`<b>${fetchedPlaceData.title}</b><br>${googleMapsLink.outerHTML}`).openPopup();

            document.getElementById('mapContainer').style.opacity = 1;
            document.getElementById('mapContainer').style.transform = 'translateY(0)';
        } else {
            console.error('Error: Invalid place data.');
        }
    } catch (error) {
        console.error('Error loading places on the map:', error);
    }
}

window.onload = function () {
    loadPlacesOnMap();
};



    // Wrap the code in an async function
    async function loadContactDetails() {
        // Contact section
        const contactDetails = document.querySelector(".contact-details");

        if (!contactDetails) {
            console.error("Contact details section not found on the page.");
        } else {
            try {
                const desiredPlaceId = queryParams.get("id");

                const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);

                if (fetchedPlaceData) {
                    const contact = fetchedPlaceData.contact;
                    if (contact && contact.length > 0) {
                        contactDetails.innerHTML += `<h5>Contact Details</h5>`;
                        // contactDetails.innerHTML += `<p>Phone:</p>`;

                        // Display each phone number with the fas icon on a new line
                        for (const phoneNumber of contact) {
                            contactDetails.innerHTML += `<p><i class="fas fa-phone"></i> ${phoneNumber}</p>`;
                        }
                    } else {
                        console.warn("Contact numbers not available.");
                        alert("Contact numbers not available.");
                    }
                } else {
                    console.warn("Error fetching contact data.");
                    alert("Error fetching contact data.");
                }
            } catch (error) {
                console.error("Error occurred during fetching contact data:", error);
                alert("Error fetching contact data.");
            }
        }
    }


    // Function to load address (now declared as async)
    async function loadAddress() {
        // Address section
        const addressSection = document.querySelector(".address");

        if (!addressSection) {
            console.error("Address section not found on the page.");
            return;
        }

        try {
            const desiredPlaceId = queryParams.get("id");

            const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);

            if (fetchedPlaceData) {
                const address = `${fetchedPlaceData.barangay}, ${fetchedPlaceData.city}, ${fetchedPlaceData.province}`;

                // Display address
                addressSection.innerHTML += `<h5>Address</h5>`;
                addressSection.innerHTML += `<p>${address}</p>`;
            } else {
                console.warn("Error fetching place data.");
                alert("Error fetching place data.");
            }
        } catch (error) {
            console.error("Error occurred during fetching data:", error);
            alert("Error fetching data.");
        }
    }

    // Call the functions
    loadContactDetails();
    loadAddress();



    const facebookButton = document.getElementById("facebookIcon");

    if (!facebookButton) {
        console.error("Facebook button not found on the page.");
    } else {
        facebookButton.addEventListener("click", async function () {

            try {
                const desiredPlaceId = queryParams.get("id");


                const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);



                if (fetchedPlaceData?.social_links?.fb &&
                    fetchedPlaceData.social_links.fb !== 'undefined' &&
                    fetchedPlaceData.social_links.fb !== 'none' &&
                    fetchedPlaceData.social_links.fb !== '' &&
                    fetchedPlaceData.social_links.fb !== null) {

                    window.open(fetchedPlaceData.social_links.fb, "_blank");
                } else {
                    console.warn("Facebook link not available, is 'undefined', 'none', or is a falsy value.");
                    window.alert("Facebook link not available.");
                }
            } catch (error) {
                console.error("Error occurred during fetching place data:", error);
                window.alert("Error fetching Facebook link.");
            }
        });
    }


    // Website button
    const websiteButton = document.getElementById("websiteIcon");

    if (!websiteButton) {
        console.error("Website button not found on the page.");
    } else {
        websiteButton.addEventListener("click", async function () {

            try {
                const desiredPlaceId = queryParams.get("id");

                const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);



                if (fetchedPlaceData?.social_links?.website &&
                    fetchedPlaceData.social_links.website !== 'undefined' &&
                    fetchedPlaceData.social_links.website !== 'none') {
                    let websiteUrl = fetchedPlaceData.social_links.website;
                    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                        websiteUrl = `https://${websiteUrl}`;
                    }

                    window.open(websiteUrl, "_blank");
                } else {
                    console.warn("Website link not available, or it is 'undefined' or 'none'.");
                    alert("Website link not available.");
                }
            } catch (error) {
                console.error("Error occurred during fetching website data:", error);
                alert("Error fetching website link.");
            }
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

    // Fetch data from the API
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places`)
        .then(response => response.json())
        .then(data => {
            console.log('All Places:', data);

            const ulNearbyPlaces = document.getElementById('ul-nearby-places');

            if (!ulNearbyPlaces) {
                console.error('UL element not found.');
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

                    const desiredCity = desiredPlaceData.city;

                    // Filter places with the same city as the desired place
                    const filteredPlaces = data.filter(place => place.city === desiredCity);

                    filteredPlaces.forEach(place => {
                        const li = document.createElement('li');
                        li.className = 'li-nearby-places';

                        // Add an event listener to each list item
                        li.addEventListener('click', () => {
                            // Redirect to explore_cardcontent.php with the selected place ID
                            window.location.href = `explore_cardcontent.php?id=${place.id}`;
                        });

                        const divRow = document.createElement('div');
                        divRow.className = 'row';

                        const divImage = document.createElement('div');
                        divImage.className = 'col-md-2';

                        const firstImage = place.photos && place.photos.length > 0 ? place.photos[0] : '';
                        divImage.innerHTML = `<div style="background-image: url('${firstImage}'); background-size: cover; height: 40px; width: 40px; background-position: center center;"></div>`;

                        const divContent = document.createElement('div');
                        divContent.className = 'col-md-10';
                        divContent.innerHTML = `<h5 class="h5-nearby-places">${place.title}</h5><p class="p-nearby-places">${place.city}, ${place.province}</p>`;

                        divRow.appendChild(divImage);
                        divRow.appendChild(divContent);

                        li.appendChild(divRow);

                        ulNearbyPlaces.appendChild(li);
                    });
                })
                .catch(error => console.error('Error fetching data for the desired place:', error));
        })
        .catch(error => console.error('Error fetching data:', error));




});

// function initMap() {
//     var map = L.map('map').setView([13.9450, 121.1312], 9);

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//     }).addTo(map);

//     // Define an array of places with their coordinates
//     var places = [
//         { lat: 13.7291, lon: 120.8859, name: "Camp Netanya Resort and Spa" },
//         { lat: 13.7264, lon: 120.8832, name: "Aquaventure Reef Club" },
//         { lat: 13.7070, lon: 120.8776, name: "Casita Ysabel" },
//         { lat: 13.7212, lon: 120.8748, name: "Eagle Point Beach and Dive Resort" },
//         { lat: 13.7309, lon: 120.8863, name: "La Chevrerie resort and Spa" },
//         { lat: 13.7973, lon: 120.9196, name: "Sadayo Beach Resort" },
//         { lat: 13.8037, lon: 120.9123, name: "Camp Raya Adventure Resort" },
//         { lat: 13.7832, lon: 120.9273, name: "Destino Beach Club Dive Resort and Hotel" },
//         { lat: 13.7967, lon: 120.9201, name: "New Yorkers Resort" },
//         { lat: 13.7953, lon: 120.9207, name: "La Thalia Beach Resort" },
//         { lat: 13.8001, lon: 120.6338, name: "Stilts Calatagan Resort" },
//         { lat: 13.7986, lon: 120.6376, name: "Manuel Uy Beach Resort" },
//         { lat: 14.1334, lon: 120.5797, name: "Punta Fuego" },
//         { lat: 13.5512, lon: 121.0700, name: "Verde Island" },
//         { lat: 14.0568, lon: 120.4920, name: "Fortune Island" },
//         { lat: 13.6872, lon: 120.8323, name: "Sepoc Beach" },
//         { lat: 14.1252, lon: 120.5988, name: "Tali Beach" },
//         { lat: 14.1940, lon: 120.5873, name: "Santelmo Cove" },
//         { lat: 13.7560, lon: 120.9186, name: "Anilao Beach Club" },
//         { lat: 13.6462, lon: 120.8664, name: "Masasa Beach" },

//     ];

//     // Loop through the places array and create markers for each place
//     places.forEach(function (place) {
//         var marker = L.marker([place.lat, place.lon]).addTo(map);
//         marker.bindPopup(place.name);
//     });

//     // Show the map container with animation
//     document.getElementById('mapContainer').style.opacity = 1;
//     document.getElementById('mapContainer').style.transform = 'translateY(0)';
// }

// window.onload = function () {
//     initMap();
// };

