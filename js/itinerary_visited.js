document.addEventListener("DOMContentLoaded", function () {
  const favoritesButton = document.getElementById("favoritesButton");
  const visitedButton = document.getElementById("visitedButton");
  const builderButton = document.getElementById("builderButton");
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    // Redirect to the login page
    window.location.href = 'login_register.php';
    return; // Stop executing further code
  }

  favoritesButton.addEventListener("click", function() {
    window.location.href = "itinerary_favorites.php"; 
  });

  visitedButton.addEventListener("click", function() {
    window.location.href = "itinerary_visited.php"; 
  });
  accountButton.addEventListener("click", function () {
    window.location.href = "user-profile.php";
  });
  builderButton.addEventListener("click", function () {
    window.location.href = "itinerary-builder.php";
  });

  const carouselInner = document.querySelector('.carousel-inner');
  const images = [
    'image/banig.jpg',
    'image/bg1.jpg',
    'image/barako.jpg',
];


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

  const isLoggedIn = localStorage.getItem('access_token') !== null;

  if (isLoggedIn) {
    function parseJwt(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    }

    const access_token = localStorage.getItem('access_token');

    const userId = parseJwt(access_token);

    Promise.all([
      fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places`),
      fetch(`${API_PROTOCOL}://${API_HOSTNAME}/feedbacks/user/${userId.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        }
      })
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(([placesData, visitedData]) => {
      const boxContainer = document.querySelector('.box-container');

      visitedData.forEach(item => {
        const placeInfo = placesData.find(place => place.id == item.place_id);
        if (placeInfo) {
          const box = document.createElement('div');
          box.classList.add('box');

          const starRatings = '<div class="star-ratings">' + '<i class="fas fa-star"></i>'.repeat(parseInt(item.rating)) + '</div>';

          box.innerHTML = `
            <div class="image">
              <img src="${placeInfo.photos[0]}" alt="">
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
                  <p>Comment: ${item.comment}</p>
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
