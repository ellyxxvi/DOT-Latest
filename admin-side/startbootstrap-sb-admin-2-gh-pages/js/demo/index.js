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

// popular destination
document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/places')
        .then(response => response.json())
        .then(data => {
            data.forEach(service => {
                const storedVisits = localStorage.getItem(`service_${service.id}_visits`);
                if (storedVisits) {
                    service.visits = parseInt(storedVisits);
                }
            });

            // Sort the data based on visits
            data.sort((a, b) => b.visits - a.visits);

            const top5Places = data.slice(0, 5);

            const destinationsData = top5Places.map((places, index) => ({
                name: places.title,
                visits: places.visits,
                progress: places.progress,
                rank: index + 1,
            }));

            const popularDestinationsContainer = document.getElementById('popular-destinations');

            popularDestinationsContainer.classList.add('wider-container');

            const ulElement = document.createElement('ul');
            ulElement.className = 'no-bullet';

            destinationsData.forEach(destination => {
                const liElement = document.createElement('li');
                console.log('Progress:', destination.progress);
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
        .catch(error => console.error('Error fetching data:', error));
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
const locationData = [
    { name: "Incorrect or no APN", progress: 95 },
    { name: "Mobile data connection disabled", progress: 90 },
    { name: "No network selected", progress: 70 },
    { name: "Possible software issues", progress: 60 },
    { name: "Device has developed faulty software", progress: 30 }
];

function populateLocation() {
    const locationList = document.getElementById("location-list");

    locationList.innerHTML = "";

    locationData.forEach(location => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <span class="chart-progress-indicator chart-progress-indicator--increase">
                <span class="chart-progress-indicator__number">${location.progress}</span>
            </span> 
            ${location.name}
            <div class="progress wds-progress progress-bar-blue">
                <div class="progress-bar" style="width: ${location.progress}%;"></div>
            </div>
        `;
        locationList.appendChild(listItem);
    });
}

populateLocation();

// RECENT ACTIVITY
const recentActivity = [
    {
      userImage: 'https://i.imgur.com/UIhwGhr.jpg',
      userName: 'Timothy Husai',
      activityText: 'For what reason would it be advisable.',
      timeAgo: '24 min ago',
    },
    {
      userImage: 'https://i.imgur.com/rAInTHU.jpg',
      userName: 'Simkil Ahleu',
      activityText: 'That might be a little bit risky to have a crew.',
      timeAgo: '12 hours ago',
    },
    {
      userImage: 'https://i.imgur.com/rAInTHU.jpg',
      userName: 'John Deo',
      activityText: 'For what reason would it be advisable.',
      timeAgo: '2 min ago',
    },
    {
      userImage: 'https://i.imgur.com/UIhwGhr.jpg',
      userName: 'John Deo',
      activityText: 'Member like them. For what reason.',
      timeAgo: '12 min ago',
    },
  ];
  document.addEventListener('DOMContentLoaded', function() {
    const card = document.querySelector('.user-activity-card .card-block');

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
        timeAgo.textContent = item.timeAgo;

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
});
  
