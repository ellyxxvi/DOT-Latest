document.addEventListener("DOMContentLoaded", function () {
  const favoritesButton = document.getElementById("favoritesButton");
  const visitedButton = document.getElementById("visitedButton");

  // Add event listeners to the buttons
  favoritesButton.addEventListener("click", function() {
    window.location.href = "itinerary_favorites.php"; // Redirect to index.html
  });

  visitedButton.addEventListener("click", function() {
    window.location.href = "itinerary_visited.php"; // Redirect to visited.html
  });
  accountButton.addEventListener("click", function () {
    window.location.href = "user-profile.php";
  });

  const carouselInner = document.querySelector('.carousel-inner');
  const images = [
    'image/places/churches.png',
    'image/places/hotels.png',
    'image/places/naturetrip.png',
    // Add more image URLs as needed
  ];

  // Dynamically add carousel items with images
  images.forEach((imageUrl, index) => {
    const carouselItem = document.createElement('div');
    carouselItem.classList.add('carousel-item');
    if (index === 0) {
      carouselItem.classList.add('active');
    }
    const image = document.createElement('img');
    image.src = imageUrl;
    image.classList.add('d-block', 'w-100', 'vh-100', 'object-fit-cover');
    carouselItem.appendChild(image);
    carouselInner.appendChild(carouselItem);
  });
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

  // Fetch data from both endpoints
  Promise.all([
    fetch('http://localhost:3000/places'),
    fetch(`http://localhost:3000/itinerary_visited?user_id=${userId}`)
  ])
  .then(responses => Promise.all(responses.map(response => response.json())))
  .then(([placesData, visitedData]) => {
    const boxContainer = document.querySelector('.box-container');
    console.log("Loop started");

    visitedData.forEach(item => {
  const placeInfo = placesData.find(place => place.id == item.place_id);

      if (placeInfo) {
        const box = document.createElement('div');
        box.classList.add('box');
    
        // Calculate star ratings based on the rating value
        const starRatings = '<div class="star-ratings">' + '<i class="fas fa-star"></i>'.repeat(parseInt(item.ratings)) + '</div>';
    
        box.innerHTML = `
          <div class="image">
            <img src="${placeInfo.image}" alt="">
            <span class="heart-icon">
              <i class="fas fa-heart"></i>
            </span>
          </div>
          <div class="content">
            <h3>${placeInfo.title}</h3>
            <p>${placeInfo.description}</p>
    
            <hr class="separator">
    
            <div class="ratings">
              ${starRatings}
              <div class="comments">
                <p>Comments: ${item.comment}</p>
              </div>
              <div class="date">
                <p>${item.created_at}</p>
              </div>
            </div>
          </div>
        `;
        boxContainer.appendChild(box);
      }
    });
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

}
});
