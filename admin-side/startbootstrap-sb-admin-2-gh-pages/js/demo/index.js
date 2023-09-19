// USER STATISTICS
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:3000/users');
        const userData = await response.json();

        const totalUsers = userData.length;
        const menUsers = userData.filter(user => user.gender === 'Male').length; 
        const womenUsers = userData.filter(user => user.gender === 'Female').length; 

        document.querySelector('#total-users').textContent = totalUsers;
        document.querySelector('#men-users').textContent = menUsers;
        document.querySelector('#women-users').textContent = womenUsers;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Define your authentication token or credentials
    const authToken = 'access_token';

    // Fetch visit data from the server with authentication headers
    fetch('http://13.229.106.142/analytics/places/most-visited?limit=5', {
        headers: {
            'Authorization': `Bearer ${authToken}`,
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(visitData => {

        })
        .catch(error => {
            console.error('Error fetching visit data:', error);

        });
    // Fetch visit data from the server
    fetch('http://13.229.106.142/analytics/places/most-visited?limit=5')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(visitData => {

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

            // Fetch places data from the server
            fetch('http://localhost:3000/places')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(placeData => {
                    // Merge visit counts with place data
                    placeData.forEach(place => {
                        const placeId = place.id;
                        place.visits = visitCounts[placeId] || 0;
                    });

                    // Sort places based on visits
                    placeData.sort((a, b) => b.visits - a.visits);

                    const top5Places = placeData.slice(0, 5);

                    const destinationsData = top5Places.map((place, index) => ({
                        name: place.title,
                        visits: place.visits,
                        rank: index + 1,
                    }));

                    const popularDestinationsContainer = document.getElementById('popular-destinations');

                    popularDestinationsContainer.classList.add('wider-container');

                    const ulElement = document.createElement('ul');
                    ulElement.className = 'no-bullet';

                    destinationsData.forEach(destination => {
                        const liElement = document.createElement('li');
                        liElement.innerHTML = `
                            <span class="chart-progress-indicator chart-progress-indicator--increase">
                                <span class="chart-progress-indicator__number">${destination.visits}</span>
                            </span>
                            <span class="bold-rank">Top ${destination.rank}:</span> ${destination.name}
                            <div class="progress wds-progress progress-bar-blue">
                                <div class="progress-bar" style="width: ${destination.visits}%;"></div>
                            </div>
                        `;

                        ulElement.appendChild(liElement);
                    });

                    popularDestinationsContainer.appendChild(ulElement);
                })
                .catch(error => console.error('Error fetching places data:', error));
        })
        .catch(error => console.error('Error fetching visit data:', error));
});

// MOST RATED RESORT
const resortsData = [];

function calculateAverageRating(ratings) {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + parseFloat(rating), 0);
    const average = (sum / ratings.length).toFixed(1);
    return average;
}

function fetchResortNames() {
    return fetch('http://localhost:3000/places')
        .then(response => response.json())
        .then(data => {
            const resortNames = {};
            if (Array.isArray(data)) {
                // Filter places with the "hotels" category
                const hotels = data.filter(place => place.category === "hotels");
                hotels.forEach(place => {
                    resortNames[place.id] = place.title;
                });
            }
            return resortNames;
        })
        .catch(error => {
            console.error('Error fetching resort names:', error);
            return {}; 
        });
}

async function populateAndSortResorts() {
    const resortList = document.getElementById("resort-list");

    const resortNames = await fetchResortNames();

    fetch('http://localhost:3000/itinerary_visited')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched data:', data);
            if (Array.isArray(data)) {
                resortsData.length = 0;
                data.forEach(user => {
                    const resort = {
                        name: resortNames[user.place_id] || 'Unknown Resort',
                        ratings: user.ratings.split(',').map(Number)
                    };

                    // Filter out resorts with no ratings and not in the "hotels" category
                    if (resort.ratings.length > 0 && resortNames[user.place_id] !== undefined) {
                        resortsData.push(resort);
                    }
                });
                console.log("Resorts Data: " + JSON.stringify(resortsData))
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
        })
        .catch(error => console.error('Error fetching data:', error));
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


// Initialize recentActivity as an empty array
const recentActivity = [];

document.addEventListener('DOMContentLoaded', function() {
  const card = document.querySelector('.user-activity-card .card-block');

  // Function to update the recent activity card
  function updateRecentActivity() {
    card.innerHTML = ''; // Clear the existing content

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
      userName.textContent = item.userName; // Set the full name here

      const activityText = document.createElement('p');
      activityText.className = 'text-muted m-b-0';
      activityText.textContent = item.activityText;

      const timeAgo = document.createElement('p');
      timeAgo.className = 'text-muted m-b-0';
      const timerIcon = document.createElement('i');
      timerIcon.className = 'mdi mdi-timer feather icon-clock m-r-10';
      timeAgo.appendChild(timerIcon);
      timeAgo.textContent = formatTimeAgo(item.timeAgo); // Update timeAgo here

      col2.appendChild(userName);
      col2.appendChild(activityText);
      col2.appendChild(timeAgo);

      row.appendChild(col1);
      row.appendChild(col2);

      card.appendChild(row);
    });

    // Add a link to view all activities if needed
    const viewAllLink = document.createElement('div');
    viewAllLink.className = 'text-center';
    const viewAllAnchor = document.createElement('a');
    viewAllAnchor.href = '#!';
    viewAllAnchor.className = 'b-b-primary text-primary';
    viewAllAnchor.dataset.abc = 'true';
    viewAllAnchor.textContent = 'View all Activities';
    viewAllLink.appendChild(viewAllAnchor);

    card.appendChild(viewAllLink);
  }

  // Helper function to fetch data from JSON server and handle errors
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

  // Helper function to format the time ago text
  function formatTimeAgo(timeAgo) {
    const now = new Date();
    const itemDate = new Date(timeAgo);
    const elapsed = now - itemDate;

    if (elapsed < 60000) {
      // Less than 1 minute
      return 'just now';
    } else if (elapsed < 3600000) {
      // Less than 1 hour
      const minutes = Math.floor(elapsed / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      // More than 1 hour
      const hours = Math.floor(elapsed / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
  }

  // Fetch data from the JSON server for users, places, favorites, and visited
  Promise.all([
    fetchData('http://localhost:3000/users'),
    fetchData('http://localhost:3000/places'),
    fetchData('http://localhost:3000/itinerary_favorites'),
    fetchData('http://localhost:3000/itinerary_visited')
  ])
    .then(([usersData, placesData, favoritesData, visitedData]) => {
      // Process favoritesData and visitedData here to populate recentActivity

      // Process favoritesData
      favoritesData.forEach(favorite => {
        const user = usersData.find(user => user.id === favorite.user_id);
        const place = placesData.find(place => place.id === favorite.place_id);
        if (user && place) {
          const fullName = `${user.first_name} ${user.last_name}`;
          const userActivity = {
            userImage: user.image,
            userName: fullName,
            activityText: `Added ${place.title} to favorites`,
            timeAgo: new Date().toISOString(), // Use the actual timestamp
          };
          recentActivity.push(userActivity);
        }
      });

      // Process visitedData
      visitedData.forEach(visit => {
        const user = usersData.find(user => user.id === visit.user_id);
        const place = placesData.find(place => place.id === visit.place_id);
        if (user && place) {
          const fullName = `${user.first_name} ${user.last_name}`;
          const userActivity = {
            userImage: user.image,
            userName: fullName,
            activityText: `Visited ${place.title}`,
            timeAgo: new Date().toISOString(), 
          };
          recentActivity.push(userActivity);
        }
      });

      // Call the updateRecentActivity function to update the UI
      updateRecentActivity();

      // Refresh the time ago text every minute
      setInterval(() => {
        updateRecentActivity();
      }, 60000);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
});

