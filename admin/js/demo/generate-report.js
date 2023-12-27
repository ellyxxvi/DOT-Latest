

//USER STATISTICS FETCH
async function fetchUserData(accessToken) {
    const userResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/users?role=REGULAR`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!userResponse.ok) {
        throw new Error('Network response for user data was not ok');
    }

    const rawData = await userResponse.text();
    return JSON.parse(rawData);
}

//MOST VISITED FETCH
async function fetchMostVisitedPlaces(accessToken) {
    const visitResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/analytics/places/most-visited`, {
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

    const placeResponse = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/analytics/places/most-visited`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!placeResponse.ok) {
        throw new Error('Network response for places data was not ok');
    }

    const placeData = await placeResponse.json();

    placeData.forEach(place => {
        const placeId = place.id;
        place.visits = place.visited_count || 0; // Set to 0 if visited_count is undefined
    });

    return placeData;
}


//MOST RATED RESORT
async function fetchMostRatedResorts(accessToken) {
    try {
        const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/analytics/places/most-rated?category=hotel`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const resortsData = [];

        if (Array.isArray(data)) {
            data.forEach(place => {
                const resort = {
                    name: place.title,
                    ratings: place.avg_rating || 0 // Set to 0 if avg_rating is undefined
                };
                resortsData.push(resort);
            });
        }

        return resortsData;
    } catch (error) {
        console.error('Error fetching most rated resorts:', error);
        return [];
    }
}

// USER ACTIVITY LOCATIONS
async function fetchUserActivityLocations(accessToken) {
    try {
        const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/analytics/users/most-active`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user activity locations:', error);
        return [];
    }
}

// RECENT ACTIVITY

// Function to fetch data from your endpoints
async function fetchData(url) {
    try {
        const accessToken = getAccessTokenFromLocalStorage();
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


// Function to generate the Excel report
async function generateExcelReport() {
    try {
        const accessToken = getAccessTokenFromLocalStorage();

        if (!accessToken) {
            throw new Error('Access token not found in local storage');
        }

        const userData = await fetchUserData(accessToken);

        const mostVisitedPlaces = await fetchMostVisitedPlaces(accessToken);

        const mostRatedResorts = await fetchMostRatedResorts(accessToken);

        const userActivityLocations = await fetchUserActivityLocations(accessToken);

        
        const [usersData, placesData, feedbacksData, itinerariesData] = await Promise.all([
            fetchData(`${API_PROTOCOL}://${API_HOSTNAME}/users`),
            fetchData(`${API_PROTOCOL}://${API_HOSTNAME}/places`),
            fetchData(`${API_PROTOCOL}://${API_HOSTNAME}/feedbacks`),
            fetchData(`${API_PROTOCOL}://${API_HOSTNAME}/itineraries`),
        ]);


        const recentActivityData = [];

        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Define the data for the Excel report
        const excelData = [
            ['USER STATISTICS'],
            ['Metric', 'Value'],
            ['Total Users', userData.length],
            ['Men Users', userData.filter(user => user.gender === 'male').length],
            ['Women Users', userData.filter(user => user.gender === 'female').length],
        ];

        excelData.push([]);
        excelData.push(['MOST VISITED']);
        excelData.push(['Place', 'Visit Count']);
        mostVisitedPlaces.forEach(place => {
            excelData.push([place.title, place.visits]);
        });

        excelData.push([]);
        excelData.push(['MOST RATED']);
        excelData.push(['Resort', 'Average Rating']);
        mostRatedResorts.forEach(resort => {
            excelData.push([resort.name, resort.ratings]);
        });

        excelData.push([]);
        excelData.push(['User Activity Locations']);
        excelData.push(['City', 'User Count']);
        userActivityLocations.forEach(location => {
            excelData.push([location.city, location.users_count]);
        });

        // Recent Activity
        // excelData.push([]);
        // excelData.push(['RECENT ACTIVITY']);
        // excelData.push(['User', 'Activity', 'Timestamp']);


 // Process favoritesData
 feedbacksData.forEach(favorite => {
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

         recentActivityData.push({
             userImage: user.profile_photo,
             userName: fullName,
             activityText: activityText,
             timestamp: storedTimestamp || new Date().toISOString(),
         });
     }
 });

 // Process visitedData
 itinerariesData.forEach(visit => {
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

         recentActivityData.push({
             userImage: user.profile_photo,
             userName: fullName,
             activityText: activityText,
             timestamp: storedTimestamp || new Date().toISOString(),
         });
     }
 });

        // Create a new worksheet with the data
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Dashboard Data');

        // Generate Excel as a buffer
        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Convert the buffer to a blob
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a link to download the Excel file
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dashboard_report.xlsx';
        a.click();

        // Clean up the URL and remove the link
        URL.revokeObjectURL(url);

        console.log('Excel report generated and downloaded.');
    } catch (error) {
        console.error('Error generating Excel report:', error);
    }
}

// Add an event listener to the "generate-report" button
document.getElementById('generate-report').addEventListener('click', function () {
    console.log('Button Clicked');
    generateExcelReport();
});

// Function to get the access token from local storage
function getAccessTokenFromLocalStorage() {
    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    return accessToken;
}
