document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded and running!");
    const filterButtons = document.querySelectorAll(".filter-nav button");
    const commentCardsContainer = document.querySelector(".comment-cards-container");
    const addToFavoritesBtn = document.getElementById("add-to-favorites");
    const socialIcon = document.getElementById("socialIcon");
    const queryParams = new URLSearchParams(window.location.search);
    const desiredServiceId = queryParams.get("id");

//    const isServiceFavorited = localStorage.getItem("favoriteService_" + desiredServiceId);
    const favoritesListPromise = fetchFavorites();
    favoritesListPromise
    .then(favoritesList => {
        // Use the favoritesList here
        console.log("Favorites List: " + JSON.stringify(favoritesList));
        
        // Use Promise.all to handle multiple asynchronous calls
        const checkingResultsPromises = favoritesList.map(item =>
        checkIfcurrentPlaceisFavorite(item)
        );

        return Promise.all(checkingResultsPromises);
    })
    .then(checkingResults => {
        // checkingResults is an array containing the results of all checkIfcurrentPlaceisFavorite calls
        console.log("Checking Results: " + JSON.stringify(checkingResults));

        // You can now work with the checkingResults array
        // For example, you can check if any item is not a favorite:
        const isAnyFavorite = checkingResults.some(isFavorite => isFavorite);
        if (isAnyFavorite) {
            addToFavoritesBtn.classList.add("added");
            addToFavoritesBtn.innerHTML = '<i class="fas fa-check"></i> Added to Favorites';
        } else {
           
        }


        })
    .catch(error => {
        // Handle errors here
        console.error("Error fetching favorites: " + error);
        // Handle the error appropriately
    });

    const isServiceFavorited = false;   
    // Call someFunction somewhere in your code

    let commentCards = document.querySelectorAll(".comment-card");

    function updateCommentCards() {
        commentCards = document.querySelectorAll(".comment-card");
    }


    socialIcon.addEventListener("click", function () {
        const desiredService = dynamicData.find(service => service.id === desiredServiceId);
        if (desiredService && desiredService.website) {
            const externalLink = desiredService.website;
            window.open(externalLink, "_blank");
        } else {
            console.log("Website URL not available for this service.");
        }
    });

        // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('access_token') !== null;

    // Check if the user is logged in and set the button accordingly
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
            // localStorage.setItem("favoriteService_" + desiredServiceId, "true");

            // Increment the counter for the next added item
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
            console.log("No ratings available for this service.");
            return;
        }

        // Sum up all the ratings
        const totalRating = placeComments.reduce((acc, comment) => acc + parseFloat(comment.rating), 0);

        // Calculate the average rating
        const averageRating = totalRating / placeComments.length;

        // Round to one decimal place
        const roundedAverage = Math.round(averageRating * 10) / 10;

        // Update the DOM to display the average rating
        const starsHTML = generateStars(roundedAverage);
        document.getElementById("total-rating").innerHTML = starsHTML;

        // Update the DOM to display the number of visits
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


    function processData() {
        const queryParams = new URLSearchParams(window.location.search);
        const desiredPlaceId = queryParams.get("id");

        // Find the desired service using the ID
        const desiredService = dynamicData.find(service => service.id === desiredPlaceId);

        if (!desiredService) {
            console.error("Service not found for ID:", desiredPlaceId);
            return;
        }

        // Select DOM elements
        const backgroundElement = document.querySelector(".background-image");
        const titleElement = document.querySelector("h3");
        const paragraphElement = document.querySelector(".dynamic-paragraph");

        // Set background image, title, and description
        backgroundElement.style.backgroundImage = `url('${desiredService.photos[0] || ''}')`;
        titleElement.textContent = desiredService.title;
        paragraphElement.textContent = desiredService.description;

        // Fetch comments for the desired service from the server
        fetch(`${API_PROTOCOL}://${API_HOSTNAME}/feedbacks/place/${desiredPlaceId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching comments: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(commentsData => {
                // Filter comments for the desired place_id
                const placeComments = commentsData.all;
                console.log("Comments: " + JSON.stringify(commentsData));
                calculateTotalRating(placeComments);

                if (placeComments.length === 0) {
                    console.log("No comments available for this service.");
                    return;
                }

                // Clear existing comment cards
                commentCardsContainer.innerHTML = "";

                // Create and append comment cards
                placeComments.forEach(comment => {
                    const commentCard = document.createElement("div");
                    commentCard.classList.add("comment-card");
                    commentCard.setAttribute("data-rating", comment.rating);
                    commentCard.classList.add(`rating-${comment.rating}`);

                    commentCard.innerHTML = `
                        <div class="comment-content">
                            <div class="rating">
                                ${generateStars(comment.rating)}
                            </div>
                            <h3 class="comment-title">${desiredService.title}</h3>
                            <p>${comment.comment}</p>
                            <p class="comment-date">${comment.created_at}</p>
                        </div>
                    `;
                    commentCardsContainer.appendChild(commentCard);
                });
            })
            .catch(error => {
                console.error("Error fetching comments:", error);

                // Log the detailed error response
                error.response.text().then(text => {
                    console.error("Detailed error response:", text);
                });
            });

        updateCommentCards();
    }


    // Function to filter comment cards based on selected rating
    filterButtons.forEach(button => {
        button.addEventListener("click", function () {
            // Toggle active class on clicked button
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const selectedRating = button.getAttribute("data-rating");

            // Query the DOM here to get the most up-to-date comment cards
            const currentCommentCards = document.querySelectorAll(".comment-card");

            // Filter comment cards based on selected rating
            currentCommentCards.forEach(card => {
                const cardRating = card.getAttribute("data-rating");
                console.log("Selected Rating:", selectedRating);
                console.log("Card Rating:", cardRating);

                if (selectedRating === "all" || cardRating === selectedRating) {
                    console.log("Match found");
                    card.classList.remove("none");
                } else {
                    console.log("No match found");
                    card.classList.add("none");
                }
            });

        });
    });

    
    //data buttons
    const contactButton = document.getElementById("contact-icon");
    const contactModal = document.getElementById("contactModal");
    const closeModal = document.querySelector(".close-modal");
    const copyButton = document.getElementById("copyButton");
    const contactInfo = document.getElementById("contactInfo");

    const linksButton = document.getElementById("socialIcon");
    const linksModal = document.getElementById("LinksModal");
    const linksInfo = document.getElementById("linksInfo");
    const closeModal1 = document.querySelector(".close-modal1");

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

    //social links button
    linksButton.addEventListener("click", async function () {
        const desiredPlaceId = queryParams.get("id");
        const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);

        if (fetchedPlaceData && fetchedPlaceData.social_links && fetchedPlaceData.social_links.links) {
            linksInfo.innerHTML = ''; 

            const links = Array.isArray(fetchedPlaceData.social_links.links)
                ? fetchedPlaceData.social_links.links
                : [fetchedPlaceData.social_links.links]; 

            links.forEach(link => {
                const linkElement = document.createElement('a');
                linkElement.href = link.startsWith('http') ? link : `https://${link}`;
                linkElement.textContent = link;
                linkElement.target = '_blank'; 
                linkElement.style.display = 'block'; 
                linksInfo.appendChild(linkElement);
            });
        } else {
            linksInfo.textContent = "No social links available.";
        }

        linksModal.style.display = "block";
    });


    // contact button
    contactButton.addEventListener("click", async function () {
        const desiredPlaceId = queryParams.get("id");
        const fetchedPlaceData = await fetchPlaceData(desiredPlaceId);
        if (fetchedPlaceData && fetchedPlaceData.contact) {
            contactInfo.textContent = fetchedPlaceData.contact;
        } else {
            contactInfo.textContent = "Contact information not available.";
        }

        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyButton.disabled = false;
        contactModal.style.display = "block";
    });

    //address button
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
    // Function to close the modal links
    closeModal1.addEventListener("click", function () {
        linksModal.style.display = "none";
    });
    // Function to close the modal address
    closeModal2.addEventListener("click", function () {

        addressModal.style.display = "none";
    });


    // Function to copy contact information or links to clipboard
    copyButton.addEventListener("click", function () {
        const textToCopy = contactInfo.textContent;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyButton.disabled = true;  // Disable the button after copying
            })
            .catch(err => {
                console.error("Copy failed:", err);
            });
    });


    const dynamicData = [];

    function fetchServicesData() {
        const accessToken = getAccessTokenFromLocalStorage(); // Get the access token from your localStorage or wherever you store it

        const url = `${API_PROTOCOL}://${API_HOSTNAME}/places`;
        // Fetch data using the extracted placeId
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

                // Log the 'photos' property of each item in the 'mappedData' array
                mappedData.forEach(item => {
                    console.log('Photos:', item.photos);
                });

                dynamicData.push(...mappedData);
                processData();
            })
            .catch(error => console.error(error));
    }


    fetchServicesData();

    function getUserId() {
        //console.log("ID: " + userData);
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
      
        // Return a Promise
        return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/itineraries/items/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
        })
        .then(response => {
          if (!response.ok) {
            console.log("DATA1 " + JSON.stringify(response.json()));
            throw new Error('Network response was not ok');
          }
          return response.json(); // Parse the response body as JSON
        })
        .then(data => {
          const copy = [];
          data.forEach(function (item) {
            copy.push(item.id);
          });
          console.log("DATA copy: " + JSON.stringify(copy));
          return copy;
        })
        .catch(error => {
          console.log("DATA: " + JSON.stringify(error));
          // alert('Error adding to favorites: ' + error);
          throw error; // Rethrow the error to be handled later if needed
        });
      }
      
      function checkIfcurrentPlaceisFavorite(favoritesID){
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
                    console.log("DATA4 " + JSON.stringify(response.json()));
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the response body as JSON

            }).then(data => {
                console.log("DATA5: " + JSON.stringify(data));
                if(desiredServiceId == data.place_id){
                    console.log("Favorite to");
                    addToFavoritesBtn.setAttribute("favorite-id", data.id);
                    return true;
                }else{
                    console.log("HINDI");
                    return false;
                    
                }
                
            })
            .catch(error => {
                console.log("DATA6: " + JSON.stringify(error));
                //alert('Error adding to favorites: ' + error);
            });
    }
      
      
});
