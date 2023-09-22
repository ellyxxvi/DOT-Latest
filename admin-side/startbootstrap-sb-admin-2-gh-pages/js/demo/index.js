const API_PROTOCOL = 'http';
const API_HOSTNAME = '13.229.106.142';

// USER STATISTICS
document.addEventListener('DOMContentLoaded', async function () {
  try {
    const accessToken = getAccessTokenFromLocalStorage();

    if (!accessToken) {
      throw new Error('Access token not found in local storage');
    }

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
    console.log('Raw User Data Response:', rawData);

    // Parse the response as JSON
    const userData = JSON.parse(rawData); // Move the declaration here
    console.log('User Data Response:', userData);

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
    const accessToken = localStorage.getItem('access_token');
    return accessToken;
}



//MOST VISITED
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const accessToken = getAccessTokenFromLocalStorage();

        // Fetch visit data from the server with authentication headers
        const visitResponse = await fetch('http://13.229.106.142/analytics/places/most-visited?limit=5', {
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
        const placeResponse = await fetch('http://13.229.106.142/analytics/places/most-visited?limit=5', {
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

        // // Sort places based on visits
        // placeData.sort((a, b) => b.visits - a.visits);

        const popularDestinationsContainer = document.getElementById('popular-destinations');

        popularDestinationsContainer.classList.add('wider-container');

        const ulElement = document.createElement('ul');
        ulElement.className = 'no-bullet';

        // Iterate through the sorted place data and create list items
        placeData.slice(0, 5).forEach((place, index) => {
            const liElement = document.createElement('li');
            liElement.innerHTML = `
                <span class="chart-progress-indicator chart-progress-indicator--increase">
                    <span class="chart-progress-indicator__number">${place.visits}</span>
                </span>
                <span class="bold-rank">Top ${index + 1}:</span> ${place.title}
                <div class="progress wds-progress progress-bar-blue">
                    <div class="progress-bar" style="width: ${place.visits}%;"></div>
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
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + parseFloat(rating), 0);
    const average = (sum / ratings.length).toFixed(1);
    return average;
}

// Function to fetch resort names
async function fetchResortNames(accessToken) {
    try {
        const response = await fetch('http://13.229.106.142/analytics/places/most-rated?category=resort&limit=5', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched resort data:', data);

        const resortNames = {};
        if (Array.isArray(data)) {
            // Filter places with the "hotels" category
            const resort = data.filter(place => place.category === "resort");
            resort.forEach(place => {
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

    const accessToken = getAccessTokenFromLocalStorage();

    if (!accessToken) {
        console.error('Access token is missing or invalid.');
        return;
    }

    const resortNames = await fetchResortNames(accessToken);

    try {
        const response = await fetch('http://13.229.106.142/analytics/places/most-rated?category=resort&limit=5', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched resort data:', data);

        if (Array.isArray(data)) {
            resortsData.length = 0;
            data.forEach(user => {
                const resort = {
                    name: resortNames[user.place_id] || 'Unknown Resort',
                    ratings: user.ratings ? user.ratings.split(',').map(Number) : []
                };

                if (resort.ratings.length > 0 && resortNames[user.place_id] !== undefined) {
                    resortsData.push(resort);
                }
            });

            resortsData.sort((a, b) => calculateAverageRating(b.ratings) - calculateAverageRating(a.ratings));

            resortList.innerHTML = "";

            resortsData.slice(0, 5).forEach((resort, index) => {
                const averageRating = calculateAverageRating(resort.ratings);
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <span class="chart-progress-indicator chart-progress-indicator--increase">
                        <span class="chart-progress-indicator__number">${averageRating}</span>
                    </span> 
                    <span class="bold-rank">Top ${index + 1}:</span> ${resort.name}
                    <div class="progress wds-progress progress-bar-blue">
                        <div class="progress-bar" style="width: ${averageRating * 20}%;"></div>
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
function populateLocation() {
    const locationList = document.getElementById("location-list");

    fetch("http://localhost:3000/users")
        .then(response => response.json())
        .then(userData => {

            const activeUsersByCity = {};

            userData.forEach(user => {
                const cityName = user.current_city;

                if (activeUsersByCity.hasOwnProperty(cityName)) {
                    activeUsersByCity[cityName]++;
                } else {
                    activeUsersByCity[cityName] = 1;
                }
            });

            // Sort cities by active user count in descending order
            const sortedCities = Object.keys(activeUsersByCity).sort((a, b) => activeUsersByCity[b] - activeUsersByCity[a]);

            locationList.innerHTML = "";

            // Display only the top 1 to top 5 cities
            for (let i = 0; i < Math.min(sortedCities.length, 5); i++) {
                const cityName = sortedCities[i];
                const activeUsersCount = activeUsersByCity[cityName];

                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <span class="chart-progress-indicator chart-progress-indicator--increase">
                        <span class="chart-progress-indicator__number">${activeUsersCount}</span>
                    </span>
                    <strong>Top ${i + 1}:</strong> ${cityName}
                    <div class="progress wds-progress progress-bar-blue">
                        <div class="progress-bar" style="width: ${activeUsersCount}%;"></div>
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
const recentActivity = [];

document.addEventListener('DOMContentLoaded', function () {
    const card = document.querySelector('.user-activity-card .card-block');

    function updateRecentActivity() {
        card.innerHTML = '';

        recentActivity.forEach(item => {
            const row = document.createElement('div');
            row.className = 'row m-b-25';

            const col1 = document.createElement('div');
            col1.className = 'col-auto p-r-0';

            const uImg = document.createElement('div');
            uImg.className = 'u-img';
            const coverImg = document.createElement('img');
            coverImg.src = item.userImage;
            coverImg.alt = 'user image';
            coverImg.className = 'img-radius cover-img';
            const profileImg = document.createElement('img');
            profileImg.src = 'https://img.icons8.com/office/16/000000/active-state.png';
            profileImg.alt = 'user image';
            profileImg.className = 'img-radius profile-img';

            uImg.appendChild(coverImg);
            uImg.appendChild(profileImg);
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

            card.appendChild(row);
        });
    }

    async function fetchData(url) {
        try {
            const response = await fetch(url);
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
        fetchData('http://localhost:3000/users'),
        fetchData('http://localhost:3000/places'),
        fetchData('http://localhost:3000/itinerary_favorites'),
        fetchData('http://localhost:3000/itinerary_visited')
    ])
        .then(([usersData, placesData, favoritesData, visitedData]) => {
            // Process favoritesData
            favoritesData.forEach(favorite => {
                const user = usersData.find(user => user.id === favorite.user_id);
                const place = placesData.find(place => place.id === favorite.place_id);

                if (user && place) {
                    const fullName = `${user.first_name} ${user.last_name}`;
                    const timestampKey = `favorite_${favorite.id}_timestamp`;
                    const storedTimestamp = getStoredTimestamp(timestampKey);

                    const activityText = `Added ${place.title} to favorites`;

                    if (!storedTimestamp) {
                        const timestamp = new Date().toISOString();
                        storeTimestamp(timestampKey, timestamp);
                    }

                    recentActivity.push({
                        userImage: user.image,
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
                    const storedTimestamp = getStoredTimestamp(timestampKey);

                    const activityText = place ? `Visited ${place.title}` : `Visited a place`;

                    if (!storedTimestamp) {
                        const timestamp = new Date().toISOString();
                        storeTimestamp(timestampKey, timestamp);
                    }

                    recentActivity.push({
                        userImage: user.image,
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

