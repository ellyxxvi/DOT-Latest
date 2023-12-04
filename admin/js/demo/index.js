const API_PROTOCOL = 'https';
const API_HOSTNAME = 'goexplorebatangas.com/api';

// Function to get the user's role from the access token
function getRole(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload).role;
}

// Function to update the user interface based on the role
function updateUI(role) {
    var userDropdown = document.getElementById('userDropdown');
    var roleElement = userDropdown.querySelector('.role');

    if (role === 'SUPER_ADMIN') {
        roleElement.innerText = 'SUPER ADMIN';
    } else if (role === 'ADMIN') {
        roleElement.innerText = 'ADMIN/STAFF';
    }
}

// Get the access token from local storage
var accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');

if (accessToken) {
    var userRole = getRole(accessToken);
    updateUI(userRole);
}

// USER STATISTICS
document.addEventListener('DOMContentLoaded', async function () {
    const logoutButton = document.getElementById('logoutButton');

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('access_token_super_admin');
        localStorage.removeItem('access_token_admin');
        window.location.href = 'login.html';
    });

    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    
    if (!accessToken) {
        window.location.href = 'login.html';
        return; 
    }

    try {
        // Use the accessToken variable obtained earlier
        const userResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users?role=REGULAR`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            const responseData = await userResponse.text();
            console.error(`Error fetching user data: ${userResponse.status} ${userResponse.statusText}`, responseData);
            throw new Error('Network response for user data was not ok');
        }

        const rawData = await userResponse.text();
        // Parse the response as JSON
        const userData = JSON.parse(rawData);

        const totalUsers = userData.length;
        const menUsers = userData.filter(user => user.gender === 'male').length;
        const womenUsers = userData.filter(user => user.gender === 'female').length;

        document.querySelector('#total-users').textContent = totalUsers;
        document.querySelector('#men-users').textContent = menUsers;
        document.querySelector('#women-users').textContent = womenUsers;

    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
});



function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    return accessToken;
}



document.addEventListener('DOMContentLoaded', async function () {
    const logoutButton = document.getElementById('logoutButton');

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('access_token_super_admin');
        localStorage.removeItem('access_token_admin');
        window.location.href = 'login.html';
    });

    // Check if the user has an access token
    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    
    if (!accessToken) {
        window.location.href = 'login.html';
        return; 
    }

    try {
        // Fetch visit data from the server with authentication headers
        const visitResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/analytics/places/most-visited?limit=5`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!visitResponse.ok) {
            throw new Error('Network response for visit data was not ok');
        }

        const visitData = await visitResponse.json();

        const visitCounts = {};

        // Count visits per place
        visitData.forEach(visit => {
            const placeId = visit.place_id;
            if (visitCounts.hasOwnProperty(placeId)) {
                visitCounts[placeId]++;
            } else {
                visitCounts[placeId] = 1;
            }
        });

        // Fetch places data from the server with authentication headers
        const placeResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/analytics/places/most-visited?limit=5`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!placeResponse.ok) {
            throw new Error('Network response for places data was not ok');
        }

        const placeData = await placeResponse.json();

        // Merge visit counts with place data
        placeData.forEach(place => {
            const placeId = place.id;
            place.visits = visitCounts[placeId] || 0;
        });

        // Sort places based on visits
        placeData.sort((a, b) => b.visits - a.visits);

        const popularDestinationsContainer = document.getElementById('popular-destinations');

        popularDestinationsContainer.classList.add('wider-container');

        const ulElement = document.createElement('ul');
        ulElement.className = 'no-bullet';

        // Iterate through the sorted place data and create list items
        placeData.slice(0, 5).forEach((place, index) => {
            const liElement = document.createElement('li');
            liElement.innerHTML = `
                <span class="chart-progress-indicator chart-progress-indicator--increase">
                    <span class="chart-progress-indicator__number">${place.visited_count}</span>
                </span>
                <span class="bold-rank">Top ${index + 1}:</span> ${place.title}
                <div class="progress wds-progress progress-bar-blue">
                    <div class="progress-bar" style="width: ${place.visited_count}%;"></div>
                </div>
            `;

            ulElement.appendChild(liElement);
        });

        // Append the created list to the container
        popularDestinationsContainer.appendChild(ulElement);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});



// MOST RATED RESORT
const resortsData = [];
function calculateAverageRating(ratings) {
    if (ratings.length === 0) return '0.00'; // Return '0.00' for no ratings
    const sum = ratings.reduce((total, rating) => total + parseFloat(rating), 0);
    const average = (sum / ratings.length).toFixed(2); // Use toFixed(2) to format to 2 decimal places
    return average;
}


// Function to fetch resort names
async function fetchResortNames(accessToken) {
    try {
        const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/analytics/places/most-rated?category=resort&limit=5`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const resortNames = {};
        if (Array.isArray(data)) {
            data.forEach(place => {
                resortNames[place.id] = place.title;
            });
        }

        return resortNames;
    } catch (error) {
        console.error('Error fetching resort names:', error);
        return {};
    }
}

// Function to calculate average rating
function calculateAverageRating(ratings) {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + parseFloat(rating), 0);
    const average = (sum / ratings.length).toFixed(1);
    return average;
}

// Function to populate and sort resorts
async function populateAndSortResorts() {
    const resortList = document.getElementById("resort-list");

    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');

    if (!accessToken) {
        console.error('Access token is missing or invalid.');
        return;
    }

    const resortNames = await fetchResortNames(accessToken);

    try {
        const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/analytics/places/most-rated?category=resort&limit=5`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            // Filter only resorts
            const resorts = data.filter(place => place.category === "resort");
            resortsData.length = 0;

            resorts.forEach(user => {
                const resort = {
                    name: user.title,
                    ratings: user.avg_rating
                };

                resortsData.push(resort);
            });

            // Sort resorts by average rating
            resortsData.sort((a, b) => parseFloat(b.ratings) - parseFloat(a.ratings));

            resortList.innerHTML = "";

            resortsData.slice(0, 5).forEach((resort, index) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <span class="chart-progress-indicator chart-progress-indicator--increase">
                        <span class="chart-progress-indicator__number">${parseFloat(resort.ratings).toFixed(2)}</span>
                    </span> 
                    <span class="bold-rank">Top ${index + 1}:</span> ${resort.name}
                    <div class="progress wds-progress progress-bar-blue">
                        <div class="progress-bar" style="width: ${(parseFloat(resort.ratings) * 20).toFixed(2)}%;"></div>
                    </div>
                `;
                resortList.appendChild(listItem);
            });
        } else {
            console.error('Fetched data is not an array:', data);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

populateAndSortResorts();

// User Activity Locations
const locationList = document.getElementById("location-list");

function populateLocation() {
    const accessToken = getAccessTokenFromLocalStorage();
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/analytics/users/most-active?limit=5`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => response.json())
        .then(userData => {


            locationList.innerHTML = "";

            for (let i = 0; i < Math.min(userData.length, 5); i++) {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                        <span class="chart-progress-indicator chart-progress-indicator--increase">
                            <span class="chart-progress-indicator__number">${userData[i].users_count}</span>
                        </span>
                        <strong>Top ${i + 1}:</strong> ${userData[i].city}
                        <div class="progress wds-progress progress-bar-blue">
                            <div class="progress-bar" style="width: ${userData[i].users_count}%;"></div>
                        </div>
                    `;

                locationList.appendChild(listItem);
            }
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
        });
}

populateLocation();


//RECENT ACTIVITY
const recentActivityFavorites = [];
const recentActivityVisited = [];

document.addEventListener('DOMContentLoaded', function () {
  const logoutButton = document.getElementById('logoutButton');

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('access_token_super_admin');
    localStorage.removeItem('access_token_admin');

    window.location.href = 'login.html';
  });

  // Check if the user has an access token
  const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
  if (!accessToken) {
    // Redirect to the login page
    window.location.href = 'login.html';
    return; // Stop executing further code
  }
    const cardFavorites = document.querySelector('.user-activity-card .card-block-favorites');
    const cardVisited = document.querySelector('.user-activity-card .card-block-visited');

    function updateRecentActivity() {
        cardFavorites.innerHTML = '';
        cardVisited.innerHTML = '';

        recentActivityFavorites.forEach(item => {
            const row = document.createElement('div');
            row.className = 'row m-b-25';
        
            const col1 = document.createElement('div');
            col1.className = 'col-auto p-r-0';
        
            const uImg = document.createElement('div');
            uImg.className = 'u-img';
            const coverImg = document.createElement('img');
            
            if (item.userImage) {
                coverImg.src = item.userImage;
            } else {
                coverImg.src = '../image/male.png'; // Set the path to your default image
            }
            
            coverImg.alt = 'user image';
            coverImg.className = 'img-radius cover-img';
            // const profileImg = document.createElement('img');
            // profileImg.src = 'https://img.icons8.com/office/16/000000/active-state.png';
            // profileImg.alt = 'user image';
            // profileImg.className = 'img-radius profile-img';
        
            uImg.appendChild(coverImg);
            // uImg.appendChild(profileImg);
            col1.appendChild(uImg);
        
            const col2 = document.createElement('div');
            col2.className = 'col';
        
            const userName = document.createElement('h6');
            userName.className = 'm-b-5';
            userName.textContent = item.userName;
        
            const activityText = document.createElement('p');
            activityText.className = 'text-muted m-b-0';
            activityText.textContent = item.activityText;
        
            const timeAgo = document.createElement('p');
            timeAgo.className = 'text-muted m-b-0';
            const timerIcon = document.createElement('i');
            timerIcon.className = 'mdi mdi-timer feather icon-clock m-r-10';
            timeAgo.appendChild(timerIcon);
            timeAgo.textContent = formatTimeAgo(item.timestamp);
        
            col2.appendChild(userName);
            col2.appendChild(activityText);
            col2.appendChild(timeAgo);
        
            row.appendChild(col1);
            row.appendChild(col2);
        
            cardFavorites.appendChild(row);
        });
        
        recentActivityVisited.forEach(item => {
            const row = document.createElement('div');
            row.className = 'row m-b-25';

            const col1 = document.createElement('div');
            col1.className = 'col-auto p-r-0';

            const uImg = document.createElement('div');
            uImg.className = 'u-img';
            const coverImg = document.createElement('img');
           
            if (item.userImage) {
                coverImg.src = item.userImage;
            } else {
                coverImg.src = '../image/male.png'; // Set the path to your default image
            }
            
            coverImg.alt = 'user image';
            coverImg.className = 'img-radius cover-img';
            // const profileImg = document.createElement('img');
            // profileImg.src = 'https://img.icons8.com/office/16/000000/active-state.png';
            // profileImg.alt = 'user image';
            // profileImg.className = 'img-radius profile-img';

            uImg.appendChild(coverImg);
            // uImg.appendChild(profileImg);
            col1.appendChild(uImg);

            const col2 = document.createElement('div');
            col2.className = 'col';

            const userName = document.createElement('h6');
            userName.className = 'm-b-5';
            userName.textContent = item.userName;

            const activityText = document.createElement('p');
            activityText.className = 'text-muted m-b-0';
            activityText.textContent = item.activityText;

            const timeAgo = document.createElement('p');
            timeAgo.className = 'text-muted m-b-0';
            const timerIcon = document.createElement('i');
            timerIcon.className = 'mdi mdi-timer feather icon-clock m-r-10';
            timeAgo.appendChild(timerIcon);
            timeAgo.textContent = formatTimeAgo(item.timestamp);

            col2.appendChild(userName);
            col2.appendChild(activityText);
            col2.appendChild(timeAgo);

            row.appendChild(col1);
            row.appendChild(col2);

            cardVisited.appendChild(row);
        });

    }

    async function fetchData(url) {
        try {
            const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    function formatTimeAgo(timeAgo) {
        const now = new Date();
        const itemDate = new Date(timeAgo);
        const elapsed = now - itemDate;

        if (elapsed < 60000) {
            return 'just now';
        } else if (elapsed < 3600000) {
            const minutes = Math.floor(elapsed / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            const hours = Math.floor(elapsed / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
    }

    function storeTimestamp(key, timestamp) {
        localStorage.setItem(key, timestamp);
    }

    function getStoredTimestamp(key) {
        return localStorage.getItem(key);
    }

    // Fetch data from the JSON server for users, places, favorites, and visited

    Promise.all([
        fetchData(`${API_PROTOCOL}://${API_HOSTNAME}/users`),
        fetchData(`${API_PROTOCOL}://${API_HOSTNAME}/places`),
        fetchData(`${API_PROTOCOL}://${API_HOSTNAME}/feedbacks`),
        fetchData(`${API_PROTOCOL}://${API_HOSTNAME}/itineraries`),
    ])
        .then(([usersData, placesData, visitedData, favoritesData]) => {
            // Process favoritesData
            favoritesData.forEach(favorite => {
                const user = usersData.find(user => user.id === favorite.user_id);
                const place = placesData.find(place => place.id === favorite.place_id);

                if (user && place) {
                    const fullName = `${user.first_name} ${user.last_name}`;
                    const timestampKey = `favorite_${favorite.id}_timestamp`;
                    const storedTimestamp = favorite.created_at;

                    const activityText = `Added ${place.title} to favorites`;

                    if (!storedTimestamp) {
                        const timestamp = new Date().toISOString();
                        // storeTimestamp(timestampKey, timestamp);
                    }

                    recentActivityFavorites.push({
                        userImage: user.profile_photo,
                        userName: fullName,
                        activityText: activityText,
                        timestamp: storedTimestamp || new Date().toISOString(),
                    });
                }
            });

            // Process visitedData
            visitedData.forEach(visit => {
                const user = usersData.find(user => user.id === visit.user_id);
                const place = placesData.find(place => place.id === visit.place_id);

                if (user) {
                    const fullName = `${user.first_name} ${user.last_name}`;
                    const timestampKey = `visit_${visit.id}_timestamp`;
                    const storedTimestamp = visit.created_at;

                    const activityText = place ? `Visited ${place.title}` : `Visited a place`;

                    if (!storedTimestamp) {
                        const timestamp = new Date().toISOString();
                        // storeTimestamp(timestampKey, timestamp);
                    }

                    recentActivityVisited.push({
                        userImage: user.profile_photo,
                        userName: fullName,
                        activityText: activityText,
                        timestamp: storedTimestamp || new Date().toISOString(),
                    });
                }
            });

            // Update recent activity
            updateRecentActivity();

            // Refresh recent activity periodically
            setInterval(updateRecentActivity, 60000);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });




});


