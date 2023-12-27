const API_PROTOCOL = 'https';
const API_HOSTNAME = 'goexplorebatangas.com/api';

const categoryToIcon = {
  'food': 'fas fa-utensils',
  'products': 'fas fa-shopping-basket',
  'places': 'fas fa-map-marker-alt',
  'festival': 'fas fa-gift'
};


const carousel = document.querySelector('.carousel');

async function fetchAndGenerateCards(url, cardID, clickedTitle) {
  try {
    const cardId = localStorage.getItem('selectedCardId');
    const response = await fetch(`${url}?cardId=${encodeURIComponent(cardId)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch card data`);
    }

    const cardData = await response.json();

    console.log('Fetched Data for Famous Things:', cardData);

    if (cardData.length === 0) {
      const noDataText = document.createElement('p');
      noDataText.textContent = 'THERE IS NO RELEVANT PLACES TO SHOW';
      noDataText.className = 'no-data-text';
      carousel.appendChild(noDataText);
      return;
    }

    let firstCardWidth = 0;

    cardData.forEach(card => {
      if (card && card.wheretogo_id) {
        const modifiedCity = card.whereToGo.title.toLowerCase().includes('city') ?
          card.whereToGo.title :
          `${card.whereToGo.title}`;

        // Check if modifiedCity matches clickedTitle
        if (modifiedCity === clickedTitle) {
          const cardElement = document.createElement('li');
          cardElement.className = 'card';

          const imageUrl = Array.isArray(card.photos) && card.photos.length > 0 ?
            card.photos[0] :
            '';

          cardElement.style.backgroundImage = `url('${imageUrl}')`;
          cardElement.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';

          const iconClass = categoryToIcon[card.category];

          cardElement.innerHTML = `
            <div class="icon card-icon ${iconClass}"></div>
            <h2>${card.name}</h2>
            <span>${card.category}</span>
            <span> ${modifiedCity}</span>
          `;

          const redirectUrl = card.id ? `famousthings-cardcontent.php?id=${card.id}` : '#';
          cardElement.dataset.redirectUrl = redirectUrl;

          cardElement.addEventListener('click', () => {
            const redirectUrl = cardElement.dataset.redirectUrl;
            console.log('Redirect URL:', redirectUrl);
            if (redirectUrl && redirectUrl !== '#') {
              window.top.location.href = redirectUrl;
            }
          });
          console.log('Card being displayed:', card);
          carousel.appendChild(cardElement);
        }
      }
    });

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
    console.error(`Error fetching data:`, error);
  }
}

async function fetchAndGenerateCardsForCity(city) {
  try {
    const placesUrl = `${API_PROTOCOL}://${API_HOSTNAME}/featured-things`;

    carousel.innerHTML = '';

    const clickedTitle = localStorage.getItem('clickedTitle') || 'DefaultCity';

    await Promise.all([
      fetchAndGenerateCards(placesUrl, city, clickedTitle)
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
  const selectedCity = localStorage.getItem('selectedCity') || 'DefaultCity';

  fetchAndGenerateCardsForCity(selectedCity, clickedTitle);
}

window.addEventListener('load', refreshContent);

window.addEventListener('storage', event => {
  if (event.key === 'clickedTitle' || event.key === 'selectedCity') {
    refreshContent();
  }
});

const cityOptions = document.querySelectorAll('.city-option');

cityOptions.forEach(option => {
  option.addEventListener('click', () => {
    const selectedCity = option.dataset.city || 'DefaultCity';
    localStorage.setItem('selectedCity', selectedCity);
    carousel.innerHTML = '';
    fetchAndGenerateCardsForCity(selectedCity);
    refreshContent();
  });
});
