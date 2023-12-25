const API_PROTOCOL = 'https';
const API_HOSTNAME = 'goexplorebatangas.com/api';
// const API_PROTOCOL = 'http'
// const API_HOSTNAME = '13.229.101.17/api'

const categoryToIcon = {
  'swim and beaches': 'fas fa-water',
  'nature trip': 'fas fa-leaf',
  'tourist spots': 'fas fa-location-dot',
  'hotel': 'fas fa-hotel',
  'churches': 'fas fa-church',
  'events': 'fas fa-calendar-days',

};

const carousel = document.querySelector('.carousel');

async function fetchAndGenerateCards(url, isFestival = false, city) {
  console.log('Function called');
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${isFestival ? 'festival' : 'card'} data`);
    }

    const cardData = await response.json();

    if (cardData.length === 0) {

      const noDataText = document.createElement('p');
      noDataText.textContent = 'THERE IS NO RELEVANT PLACES/EVENTS TO SHOW';
      noDataText.className = 'no-data-text';
      carousel.appendChild(noDataText);
      return;
    }

    let firstCardWidth = 0; 

    cardData.forEach(card => {
      if (card.city.toLowerCase() === city.toLowerCase()) {
        const cardElement = document.createElement('li');
        cardElement.className = 'card';
    
        const imageUrl = Array.isArray(card.images) && card.images.length > 0
          ? card.images[0]
          : Array.isArray(card.photos) && card.photos.length > 0
            ? card.photos[0]
            : '';
    
        cardElement.style.backgroundImage = `url('${imageUrl}')`;
        cardElement.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    
        const iconClass = isFestival ? 'fas fa-calendar-days' : categoryToIcon[card.category];
    
        const modifiedCity = card.city.toLowerCase().includes('city') ? card.city : `${card.city} City`;
    
        cardElement.innerHTML = `
          <div class="icon card-icon ${iconClass}"></div>
          <h2>${card.title}</h2>
          <span> ${modifiedCity}, ${card.province}</span>
        `;
    
        if (isFestival) {
          const redirectUrl = card.id ? `festival_content.php?item_id=${card.id}` : '#';
          cardElement.dataset.redirectUrl = redirectUrl;
        } else {
          const redirectUrl = card.id ? `explore_cardcontent.php?id=${card.id}` : '#';
          cardElement.dataset.redirectUrl = redirectUrl;
        }
    
        cardElement.addEventListener('click', () => {
          const redirectUrl = cardElement.dataset.redirectUrl;
          console.log('Redirect URL:', redirectUrl);
          if (redirectUrl && redirectUrl !== '#') {
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

      } else if (Math.ceil(carousel.scrollLeft) === carousel.scrollWidth - carousel.offsetWidth) {

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

async function fetchAndGenerateCardsForCity(city) {
  try {
    const festivalUrl = `${API_PROTOCOL}://${API_HOSTNAME}/events`;
    const placesUrl = `${API_PROTOCOL}://${API_HOSTNAME}/places`;

    carousel.innerHTML = '';

    await Promise.all([
      fetchAndGenerateCards(festivalUrl, true, city),
      fetchAndGenerateCards(placesUrl, false, city)
    ]);

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
  const clickedTitle = localStorage.getItem('clickedTitle') || 'DefaultCity';
  fetchAndGenerateCardsForCity(clickedTitle);
}

window.addEventListener('load', refreshContent);

window.addEventListener('storage', event => {
  if (event.key === 'clickedTitle') {
    refreshContent();
  }
});

const cityOptions = document.querySelectorAll('.city-option');

cityOptions.forEach(option => {
  option.addEventListener('click', () => {
    const selectedCity = localStorage.getItem('selectedCity') || 'DefaultCity';
    carousel.innerHTML = '';
    fetchAndGenerateCardsForCity(selectedCity);
    refreshContent();
  });
});
