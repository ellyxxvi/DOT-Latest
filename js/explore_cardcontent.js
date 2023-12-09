
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
        console.log('initializeImageGallery called ' + JSON.stringify(imageUrls));
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
    
            console.log("test");
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
        console.log('processData called');
        try {
            const queryParams = new URLSearchParams(window.location.search);
            const desiredPlaceId = queryParams.get("id");

            const desiredService = dynamicData.find((service) => service.id === desiredPlaceId);

            if (!desiredService) {
                console.error("Service not found for ID:", desiredPlaceId);
                return;
            }

            console.log('Desired Service:', desiredService);

            // Call fetchRating with desiredPlaceId
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

            console.log('Background element:', backgroundElement);


            console.log('Adding click listener to background element with URL:', imageUrl);
            backgroundElement.style.cursor = 'pointer';
            backgroundElement.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('Background element clicked, attempting to open image.');
                openBackgroundImage(imageUrl);
            });

            function openBackgroundImage(imageUrl) {
                console.log('Attempting to open background image:', imageUrl);
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


            const commentsResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/feedbacks/place/${desiredPlaceId}`);
            if (!commentsResponse.ok) {
                throw Error(`Error fetching comments: ${commentsResponse.status} ${commentsResponse.statusText}`);
            }

            const commentsData = await commentsResponse.json();
            console.log('Fetched data:', commentsData);
            const placeComments = commentsData.all;
            calculateTotalRating(placeComments);

            placeComments.forEach((comment) => {
                const commentCard = document.createElement("div");
                commentCard.classList.add("comment-card");
                commentCard.setAttribute("data-rating", comment.rating);
                commentCard.classList.add(`rating-${comment.rating}`);

                const fullName = `${comment.first_name} ${comment.last_name}` || "Anonymous";

                // Update the profilePhoto assignment
                let profilePhoto = comment.profile_photo ? `<img src="${comment.profile_photo}" alt="Profile Photo">` : "";
                if (!profilePhoto) {
                    // If no profile photo, use default based on gender
                    if (comment.gender === "male") {
                        profilePhoto = `<img src="image/male.png" alt="Male Profile Photo">`;
                    } else if (comment.gender === "female") {
                        profilePhoto = `<img src="image/female.png" alt="Female Profile Photo">`;
                    }
                }

                const location = `${comment.current_city}, ${comment.current_province}, ${comment.from_country}` || "";

                commentCard.innerHTML = `
                    <div class="comment-content">
                        <div class="rating">
                            ${generateStars(comment.rating)}
                        </div>
                        <h3 class="comment-title">${desiredService.title}</h3>
                        <p>${comment.comment}</p>
                        <div class="user-info">
                            <div class="profile-photo">
                                ${profilePhoto}
                            </div>
                            <div class="user-details">
                                <p class="user-fullname">${fullName}</p>
                                <p class="user-location">${location}</p>
                            </div>
                        </div>
                        <p class="comment-date">${comment.created_at}</p>
                    </div>
                `;
                commentCardsContainer.appendChild(commentCard);
            });

            updateCommentCards();
        } catch (error) {
            console.error("Error in processData:", error);
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


    //data buttons
    const contactButton = document.getElementById("contact-icon");
    const closeModal = document.querySelector(".close-modal");
    const copyButton = document.getElementById("copyButton");
    const contactInfo = document.getElementById("contactInfo");

    const addressButton = document.getElementById("address-icon");
    const addressModal = document.getElementById("addressModal");
    const addressInfo = document.getElementById("addressInfo");
    const closeModal2 = document.querySelector(".close-modal2");

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
            .catch(error => {
                console.error("Error fetching place data:", error);
                return null;
            });
    }

    // Contact button
    contactButton.addEventListener("click", async function () {
        const desiredPlaceId = queryParams.get("id");
        const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);
        if (fetchedPlaceData && fetchedPlaceData.contact) {
            contactInfo.textContent = fetchedPlaceData.contact;
        } else {
            contactInfo.textContent = "Contact information not available.";
        }

        copyContactButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyContactButton.disabled = false;
        contactModal.style.display = "block";
    });

    // Address button
    addressButton.addEventListener("click", async function () {
        try {
            const desiredPlaceId = queryParams.get("id");
            const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);

            if (fetchedPlaceData && fetchedPlaceData.barangay && fetchedPlaceData.city && fetchedPlaceData.province) {
                const { barangay, city, province } = fetchedPlaceData;
                const fullAddress = `${barangay}, ${city}, ${province}`;
                addressInfo.textContent = fullAddress;
            } else {
                addressInfo.textContent = "Address information not available.";
            }
            addressModal.style.display = "block";
        } catch (error) {
            console.error("Error opening address modal:", error);
            addressInfo.textContent = "Failed to retrieve address information.";
        }
    });

    // Function to close the modal contact
    closeModal.addEventListener("click", function () {
        contactModal.style.display = "none";
    });

    // Function to close the modal address
    closeModal2.addEventListener("click", function () {
        addressModal.style.display = "none";
    });

    // Function to copy contact information to clipboard
    copyContactButton.addEventListener("click", function () {
        const textToCopy = contactInfo.textContent;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyContactButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyContactButton.disabled = true;
            })
            .catch(err => {
                console.error("Copy failed:", err);
            });
    });

    // Function to copy address information to clipboard
    copyAddressButton.addEventListener("click", function () {
        const textToCopy = addressInfo.textContent;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyAddressButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyAddressButton.disabled = true;
            })
            .catch(err => {
                console.error("Copy failed:", err);
            });
    });

    const facebookButton = document.getElementById("facebookIcon");

    if (!facebookButton) {
        console.error("Facebook button not found on the page.");
    } else {
        facebookButton.addEventListener("click", async function () {
            console.log("Facebook button clicked.");
            try {
                const desiredPlaceId = queryParams.get("id");
                console.log(`Fetching data for place ID: ${desiredPlaceId}`);
                const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);

                console.log(`Fetched data:`, fetchedPlaceData);

                if (fetchedPlaceData?.social_links?.fb &&
                    fetchedPlaceData.social_links.fb !== 'undefined' &&
                    fetchedPlaceData.social_links.fb !== 'none' &&
                    fetchedPlaceData.social_links.fb !== '' &&
                    fetchedPlaceData.social_links.fb !== null) {
                    console.log(`Opening Facebook link: ${fetchedPlaceData.social_links.fb}`);
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
            console.log("Website button clicked.");
            try {
                const desiredPlaceId = queryParams.get("id");
                console.log(`Fetching data for place ID: ${desiredPlaceId}`);
                const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);

                console.log(`Fetched data:`, fetchedPlaceData);

                if (fetchedPlaceData?.social_links?.website &&
                    fetchedPlaceData.social_links.website !== 'undefined' &&
                    fetchedPlaceData.social_links.website !== 'none') {
                    let websiteUrl = fetchedPlaceData.social_links.website;
                    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                        websiteUrl = `https://${websiteUrl}`;
                    }
                    console.log(`Opening website link: ${websiteUrl}`);
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
                    };
                });

                mappedData.forEach(item => {

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
});
