document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded and running!");
    const filterButtons = document.querySelectorAll(".filter-nav button");
    const commentCardsContainer = document.querySelector(".comment-cards-container");
    const addToFavoritesBtn = document.getElementById("add-to-favorites");
    const facebookIconBtn = document.getElementById("facebook-icon");
    const queryParams = new URLSearchParams(window.location.search);
    const desiredServiceId = parseInt(queryParams.get("id"));

    const isServiceFavorited = localStorage.getItem("favoriteService_" + desiredServiceId);

    let commentCards = document.querySelectorAll(".comment-card");

    function updateCommentCards() {
        commentCards = document.querySelectorAll(".comment-card");
    }

    facebookIconBtn.addEventListener("click", function () {
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
        if (isServiceFavorited === "true") {
            addToFavoritesBtn.classList.add("added");
            addToFavoritesBtn.innerHTML = '<i class="fas fa-check"></i> Added to Favorites';
        }
    } else {
        addToFavoritesBtn.style.visibility = "hidden";
    }

    let addItemCounter = 1;
    let deleteItemCounter = 1;

    addToFavoritesBtn.addEventListener("click", function () {
        addToFavoritesBtn.classList.toggle("added");

        if (addToFavoritesBtn.classList.contains("added")) {
            addToFavoritesBtn.innerHTML = '<i class="fas fa-check"></i> Added to Favorites';
            localStorage.setItem("favoriteService_" + desiredServiceId, "true");

            const favoriteData = {
                id: desiredServiceId,
                place_id: desiredServiceId,
                user_id: getUserId(),
                created_at: getCurrentDate(),
                updated_at: getCurrentDate(),
            };

            // Increment the counter for the next added item
            addItemCounter++;

            // Add the service to favorites
            fetch('http://localhost:3000/itinerary_favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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

            // Remove the service from favorites
            fetch(`http://localhost:3000/itinerary_favorites/${desiredServiceId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
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
        const totalRating = placeComments.reduce((acc, comment) => acc + parseFloat(comment.ratings), 0);

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
        const desiredPlaceId = parseInt(queryParams.get("id"));
        const desiredService = dynamicData.find(service => service.id === desiredPlaceId);

        const backgroundElement = document.querySelector(".background-image");
        const titleElement = document.querySelector("h3");
        const paragraphElement = document.querySelector(".dynamic-paragraph");

        backgroundElement.style.backgroundImage = `url('${desiredService.image}')`;
        titleElement.textContent = desiredService.title;
        paragraphElement.textContent = desiredService.description;

        // Fetch comments for the desired service from the server
        fetch(`http://localhost:3000/itinerary_visited?place_id=${desiredPlaceId}`)
            .then(response => response.json())
            .then(commentsData => {
                // Check if the desired place_id is present in the itinerary_visited
                const placeComments = commentsData.filter(comment => parseInt(comment.place_id) === desiredPlaceId);

                calculateTotalRating(placeComments);

                if (placeComments.length === 0) {
                    console.log("No comments available for this service.");
                    return;
                }

                commentCardsContainer.innerHTML = ""; // Clear existing comment cards

                placeComments.forEach(comment => {
                    const commentCard = document.createElement("div");
                    commentCard.classList.add("comment-card");
                    commentCard.setAttribute("data-rating", comment.ratings);
                    commentCard.classList.add(`rating-${comment.ratings}`); // Add the rating class
                    commentCard.setAttribute("data-rating", comment.ratings);

                    commentCard.innerHTML = `
                        <div class="comment-content">
                            <div class="rating">
                                ${generateStars(comment.ratings)}
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
            });

        updateCommentCards();
    }

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

    const contactButton = document.getElementById("contact-icon");
    const contactModal = document.getElementById("contactModal");
    const closeModal = document.querySelector(".close-modal");
    const copyButton = document.getElementById("copyButton");
    const contactInfo = document.getElementById("contactInfo");

    function fetchContactInfo(placeId) {
        return fetch(`http://localhost:3000/places/${placeId}`)
            .then(response => response.json())
            .then(data => data.contact)
            .catch(error => {
                console.error("Error fetching contact information:", error);
                return null;
            });
    }

    // Function to open the modal
    contactButton.addEventListener("click", async function () {
        const desiredPlaceId = parseInt(queryParams.get("id"));
        const fetchedContact = await fetchContactInfo(desiredPlaceId);
        // Fetch contact information from itinerary_places
        contactInfo.textContent = fetchedContact;

        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyButton.disabled = false; // Enable the button
        contactModal.style.display = "block";
    });

    // Function to close the modal
    closeModal.addEventListener("click", function () {
        contactModal.style.display = "none";
    });

    // Function to copy contact information to clipboard
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
        fetch('http://localhost:3000/places')
            .then(response => response.json())
            .then(data => {
                const mappedData = data.map(user => {
                    return {
                        id: user.id,
                        category: user.category,
                        title: user.title,
                        description: user.description,
                        image: user.image,
                        website: user.website
                    };
                });

                console.log(mappedData);

                dynamicData.push(...mappedData);
                processData();
            })
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
});
