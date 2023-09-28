// Find the elements to populate
const bgImage = document.querySelector('.bg-image');
const overlayTitle = document.querySelector('.overlay-title');
const festivalTitle = document.querySelector('.festival-title');
const festivalDescription = document.querySelector('.festival-description');
const carouselInner = document.querySelector('.carousel-inner');

console.log('Script loaded.'); // Add this line

function populateElements(data) {
  bgImage.style.backgroundImage = `url('${data.images}')`;
  overlayTitle.textContent = data.title;
  festivalTitle.textContent = data.title;
  festivalDescription.textContent = data.description;
}

const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('item_id');

// Function to create a resort card
function createResortCard(resortData) {
  const col = document.createElement('div');
  col.classList.add('col-md-4', 'mb-3');

  const link = document.createElement('a');
  link.href = 'explore_cardcontent.php?id=' + resortData.id;
  link.style.textDecoration = 'none';
  link.style.color = 'black';

  const card = document.createElement('div');
  card.classList.add('card');

  const img = document.createElement('img');
  img.classList.add('img-fluid');
  img.alt = '100%x280';
  img.src = resortData.photos;

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const title = document.createElement('h4');
  title.classList.add('card-title');
  title.textContent = resortData.title;

  const city = document.createElement('p');
  city.classList.add('card-text');
  city.textContent = resortData.city;

  cardBody.appendChild(title);
  cardBody.appendChild(city);
  card.appendChild(img);
  card.appendChild(cardBody);
  link.appendChild(card);
  col.appendChild(link);

  return col;
}

// Fetch festival data and resort data
let festivalCity; // Declare festivalCity variable outside of the fetch blocks

fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events/${itemId}`)
  .then((response) => {
    console.log('Festival Data Response Status:', response.status);
    if (!response.ok) {
      throw new Error('Failed to fetch festival data');
    }
    return response.json();
  })
  .then((data) => {
    console.log('Festival Data:', data);
    populateElements(data);

    // Get the city information from the festival data
    festivalCity = data.city;

    // Fetch resort data
    return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places?category=resort`);
  })
  .then((response) => {
    console.log('Resorts Data Response Status:', response.status);
    if (!response.ok) {
      throw new Error('Failed to fetch resorts data');
    }
    return response.json();
  })
  .then((allResortsData) => {
    console.log('All Resorts Data:', allResortsData);

    // Filter resort data based on the city of the festival
    const filteredResortsData = allResortsData.filter(
      (resort) => resort.city === festivalCity
    );

    console.log('Filtered Resorts Data:', filteredResortsData);

    carouselInner.innerHTML = ''; // Clear previous content

    if (filteredResortsData.length === 0) {
      const noPlacesMessage = document.createElement('p');
      noPlacesMessage.textContent = 'There are no nearby places.';
      noPlacesMessage.style.textAlign = 'center';
      noPlacesMessage.style.color = 'white'; 
      carouselInner.appendChild(noPlacesMessage);

    } else {
      for (let i = 0; i < filteredResortsData.length; i += 3) {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');

        const row = document.createElement('div');
        row.classList.add('row');

        for (let j = i; j < i + 3 && j < filteredResortsData.length; j++) {
          const resortCard = createResortCard(filteredResortsData[j]);
          row.appendChild(resortCard);
        }

        carouselItem.appendChild(row);

        if (i === 0) {
          carouselItem.classList.add('active');
        }

        carouselInner.appendChild(carouselItem);
      }
    }
  })
  .catch((error) => {
    console.error('Error fetching data:', error.message);
  });
