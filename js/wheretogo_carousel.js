// const API_PROTOCOL = 'https';
// const API_HOSTNAME = 'goexplorebatangas.com/api';
const API_PROTOCOL = 'http'
const API_HOSTNAME = '13.212.85.80/api'

const categoryToIcon = {
  'swim': 'fas fa-water',
  'nature': 'fas fa-leaf',
  'tourist': 'fas fa-location-dot',
  'hotels': 'fas fa-hotel',
  'churches': 'fas fa-church',
  'events': 'fas fa-calendar-days',
  // Add more category mappings as needed
};

const carousel = document.querySelector('.carousel');

async function fetchAndGenerateCards(url, isFestival = false, city) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${isFestival ? 'festival' : 'card'} data`);
    }

    const cardData = await response.json();

    if (cardData.length === 0) {
      // Display a message when there is no data
      const noDataText = document.createElement('p');
      noDataText.textContent = 'THERE IS NO RELEVANT PLACES/EVENTS TO SHOW';
      noDataText.className = 'no-data-text';
      carousel.appendChild(noDataText);
      return;
    }

    let firstCardWidth = 0; // Initialize to 0

    cardData.forEach(card => {
      // Filter the cards based on the city
      if (card.city.toLowerCase() === city.toLowerCase()) {
        const cardElement = document.createElement('li');
        cardElement.className = 'card';

        // Extract the URL of the first image or photo
        const imageUrl = Array.isArray(card.images) && card.images.length > 0
          ? card.images[0]
          : Array.isArray(card.photos) && card.photos.length > 0
            ? card.photos[0]
            : '';

        cardElement.style.backgroundImage = `url('${imageUrl}')`;
        cardElement.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';

        const words = card.description.split(' ');
        const truncatedDescription = words.length > 10 ? words.slice(0, 10).join(' ') + '...' : card.description;

        const iconClass = isFestival ? 'fas fa-calendar-days' : categoryToIcon[card.category];

        cardElement.innerHTML = `
          <div class="icon card-icon ${iconClass}"></div>
          <h2>${card.title}</h2>
          <span>${truncatedDescription}</span>
        `;

        if (isFestival) {
          cardElement.dataset.redirectUrl = 'festival_content.php';
        } else {
          cardElement.dataset.redirectUrl = `explore_cardcontent.php?id=${card.id}`;
        }

        cardElement.addEventListener('click', () => {
          const redirectUrl = cardElement.dataset.redirectUrl;
          if (redirectUrl) {
            window.top.location.href = redirectUrl;
          }
        });

        carousel.appendChild(cardElement);
      }
    });

    // Get the first card's width if there are cards
    const firstCard = carousel.querySelector('.card');
    if (firstCard) {
      firstCardWidth = firstCard.offsetWidth;
    }

    const wrapper = document.querySelector('.wrapper');
    let isDragging = false,
      isAutoPlay = true,
      startX,
      startScrollLeft,
      timeoutId;

    carousel.addEventListener('mousedown', dragStart);
    carousel.addEventListener('mousemove', dragging);
    document.addEventListener('mouseup', dragStop);
    carousel.addEventListener('scroll', infiniteScroll);
    wrapper.addEventListener('mouseenter', () => clearTimeout(timeoutId));
    wrapper.addEventListener('mouseleave', autoPlay);

    const arrowBtns = document.querySelectorAll('.wrapper i');
    arrowBtns.forEach(btn => {
      btn.addEventListener('click', () => handleArrowButtonClick(btn));
    });

    function handleArrowButtonClick(btn) {
      carousel.scrollLeft += btn.id === 'left' ? -firstCardWidth : firstCardWidth;
    }

    function dragStart(e) {
      isDragging = true;
      carousel.classList.add('dragging');
      startX = e.pageX;
      startScrollLeft = carousel.scrollLeft;
    }

    function dragging(e) {
      if (!isDragging) return;
      carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
    }

    function dragStop() {
      isDragging = false;
      carousel.classList.remove('dragging');
    }

    function infiniteScroll() {
      if (carousel.scrollLeft === 0) {
        // Scroll to the end
      } else if (Math.ceil(carousel.scrollLeft) === carousel.scrollWidth - carousel.offsetWidth) {
        // Scroll to the beginning
      }
      clearTimeout(timeoutId);
      if (!wrapper.matches(':hover')) autoPlay();
    }

    function autoPlay() {
      if (window.innerWidth < 800 || !isAutoPlay) return;
      timeoutId = setTimeout(() => carousel.scrollLeft += firstCardWidth, 2500);
    }

    autoPlay();
  } catch (error) {
    console.error(`Error fetching ${isFestival ? 'festival' : 'card'} data:`, error);
  }
}

// Function to fetch and generate cards dynamically for a specific city
async function fetchAndGenerateCardsForCity(city) {
  try {
    const festivalUrl = `${API_PROTOCOL}://${API_HOSTNAME}/events`;
    const placesUrl = `${API_PROTOCOL}://${API_HOSTNAME}/places`;

    // Clear existing cards in the carousel
    carousel.innerHTML = '';

    // Fetch and generate cards for events and places, specifying the city
    await Promise.all([
      fetchAndGenerateCards(festivalUrl, true, city),
      fetchAndGenerateCards(placesUrl, false, city)
    ]);

    // If no cards were generated, display a message in the center
    if (carousel.childElementCount === 0) {
      const noDataTextContainer = document.createElement('div');
      noDataTextContainer.className = 'no-data-container';
      const noDataText = document.createElement('p');
      noDataText.textContent = 'There is no relevant events/places to show.';
      noDataText.className = 'no-data-text';
      noDataTextContainer.appendChild(noDataText);
      carousel.appendChild(noDataTextContainer);
    }

  } catch (error) {
    console.error('Error fetching city data or cards data:', error);
  }
}


function refreshContent() {
  // Read the selected city from local storage
  const clickedTitle = localStorage.getItem('clickedTitle') || 'DefaultCity';
  fetchAndGenerateCardsForCity(clickedTitle);
}

// Add an event listener to call refreshContent() when the page loads
window.addEventListener('load', refreshContent);

// Optionally, listen for changes in local storage
window.addEventListener('storage', event => {
  if (event.key === 'clickedTitle') {
    refreshContent();
  }
});

const cityOptions = document.querySelectorAll('.city-option');

cityOptions.forEach(option => {
  option.addEventListener('click', () => {
    const selectedCity = localStorage.getItem('selectedCity') || 'DefaultCity';
    // Clear existing cards in the carousel
    carousel.innerHTML = '';
    fetchAndGenerateCardsForCity(selectedCity);
    refreshContent();
  });
});
