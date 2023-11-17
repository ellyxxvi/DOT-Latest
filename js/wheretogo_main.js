

function fetchServicesData() {
  return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/where-to-go`)
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`Network response was not ok, Status: ${response.status}`);
      }
      return response.json();
    })
    .catch(function (error) {
      console.error('Error fetching data:', error);
      return []; 
    });
}

function generateServiceCard(service) {
  return `
    <div class="column">
      <a href="wheretogo_cardcontent.php?id=${service.id}" class="card-link">
        <div class="card">
          <div class="background-image" style="background-image: url('${service.images}');"></div>
          <div class="card-content">
            <h3>${service.title}</h3>
          </div>
        </div>
      </a>
    </div>
  `;
}

// Function to generate service cards using fetched data
function generateServiceCards() {
  fetchServicesData().then(function (servicesData) {
    const servicesContainer = document.getElementById('services-content');

    for (const service of servicesData) {
      const serviceCardHtml = generateServiceCard(service);
      servicesContainer.innerHTML += serviceCardHtml;
    }

    const serviceCards = document.querySelectorAll('.card h3');
    serviceCards.forEach(card => {
      card.addEventListener('click', function() {
        const clickedTitle = this.textContent;
        localStorage.setItem('clickedTitle', clickedTitle);
      });
    });
  });
}

// cityOptions.forEach(option => {
//   option.addEventListener('click', () => {
//     const selectedCity = option.getAttribute('data-city');
//     localStorage.setItem('selectedCity', selectedCity);
//     // Clear existing cards in the carousel
//     carousel.innerHTML = '';
//     fetchAndGenerateCardsForCity(selectedCity);
//   });
// });

// Call the function to generate service cards
generateServiceCards();
