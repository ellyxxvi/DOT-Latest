$(document).ready(function () {
  $('#dataTable').DataTable();
});

document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('tableBody');

  // Check if the user is logged in
  const isLoggedIn = localStorage.getItem('access_token') !== null;

  if (isLoggedIn) {
    // Function to get the user ID from localStorage
    function getUserId() {
      const userData = JSON.parse(localStorage.getItem('user_data'));
      if (userData && userData.id) {
        return userData.id; // Access the user ID directly
      } else {
        console.error('User data is missing or incomplete in localStorage.');
        return null;
      }
    }

    // Get the user ID of the logged-in user
    const userId = getUserId();

    if (userId !== null) {
      // Function to fetch favorites data based on the user ID
      function fetchFavoritesData(userId) {
        fetch(`http://localhost:3000/itinerary_favorites?user_id=${userId}`)
          .then(response => response.json())
          .then(data => {
            console.log('Fetched data:', data); // Log the fetched data for debugging
            if (Array.isArray(data)) {
              tableBody.innerHTML = ''; // Clear existing table data
              data.forEach(favorite => {
                const row = document.createElement('tr');
                row.innerHTML = `
                  <td>${favorite.id}</td>
                  <td>${favorite.place_id}</td>
                  <td>${favorite.user_id}</td>
                  <td>${favorite.created_at}</td>
                  <td>${favorite.updated_at}</td>
                `;
                tableBody.appendChild(row);
              });
            } else {
              console.error('Fetched data is not an array:', data);
            }
          })
          .catch(error => console.error('Error fetching data:', error));
      }

      // Call the fetchFavoritesData function to populate the table
      fetchFavoritesData(userId);
    }
  }
});

