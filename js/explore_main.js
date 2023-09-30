const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category');
console.log("JavaScript received category:", category);  // For debugging


// Use the `category` variable to filter servicesData if it's used for rendering.

let totalVisits = 0;
const MAX_VISITS = 100;
const servicesData = []; // Initialize as an empty array

const iconMappings = {
  'swim': 'fas fa-water',
  'nature': 'fas fa-leaf',
  'tourist': 'fas fa-location-dot',
  'resort': 'fas fa-hotel',
  'churches': 'fas fa-church',
  'events': 'fas fa-calendar-days',
};

function generateServiceCard(service) {
  const iconClass = iconMappings[service.category] || 'fas fa-question';

  const words = service.description.split(" ");
      console.log("working");
      const truncatedDescription = words.length > 15 ? 
                                   words.slice(0, 15).join(" ") + "..." : 
                                   service.description;

  return `
    <div class="column card-link" service-id="${service.id}">
      <a href="explore_cardcontent.php?id=${service.id}">
        <div class="card">
          <div class="background-image" style="background-image: url('${service.backgroundImage}');"></div>
          <div class="icon-wrapper">
            <i class="${iconClass}"></i>
          </div>
          <div class="card-content">
            <h3>${service.title}</h3>
            <p>${truncatedDescription}</p>
          </div>
        </div>
      </a>
    </div>
  `;
}


function fetchServicesData() {
  fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places`)
    .then(response => response.json())
    .then(data => {
      // Map the fetched data to match the required structure
      const mappedData = data.map(user => {
        return {
          id: user.id,
          category: user.category,
          title: user.title,
          description: user.description,
          backgroundImage: user.photos,
        };
      });

      servicesData.push(...mappedData);
      displayServiceCards(servicesData.slice(0, initialItems));
    })
    .catch(error => console.error('Error fetching data:', error));
}

const initialItems = 9;
const itemsPerPage = 3;
let currentPage = 0;

function updateButtons() {
const loadMoreBtn = document.getElementById('load-more-btn');
if (currentPage * itemsPerPage + initialItems >= servicesData.length) {
  loadMoreBtn.textContent = 'Load Less';
  loadMoreBtn.style.display = 'block'; // Display the button when at the end
} else if (currentPage * itemsPerPage + initialItems < servicesData.length) {
  loadMoreBtn.textContent = 'Load More';
  loadMoreBtn.style.display = 'block'; // Display the button when there's more to load
} else {
  loadMoreBtn.style.display = 'none'; // Hide the button when there's nothing more to load
}
}


function displayServiceCards(data) {
const servicesContent = document.querySelector('.services-content .row');
servicesContent.innerHTML = '';

const endIndex = Math.min(currentPage * itemsPerPage + initialItems, data.length);
for (let i = 0; i < endIndex; i++) {
  const cardMarkup = generateServiceCard(data[i]);
  servicesContent.insertAdjacentHTML('beforeend', cardMarkup);
}

updateButtons();
const contentContainer = document.getElementById('load-more-btn');
contentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

// Get all elements with the class "card-link"
const cardLinks = document.querySelectorAll('.card-link');

cardLinks.forEach(cardLink => {
  cardLink.addEventListener('click', function (event) {
      // Get the service-id attribute value
      const serviceId = cardLink.getAttribute('service-id');
      // Call the handleCardClick function with the serviceId
      handleCardClick(serviceId);
  });
});
}



function toggleLoadMore() {
const activeCategory = document.querySelector('.category-link.active');
const selectedCategory = activeCategory ? activeCategory.getAttribute('data-category') : null;

const filteredServices = selectedCategory
  ? servicesData.filter(service => service.category === selectedCategory)
  : servicesData;

if (currentPage * itemsPerPage + initialItems >= filteredServices.length) {
  currentPage = 0; // Reset to the first page if we're at the end
} else {
  currentPage++;
}

displayServiceCards(filteredServices);
}


const contentContainer = document.getElementById('load-more-btn');
contentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });


function resetContent() {
  
  console.log('hello');
currentPage = 1;
const activeCategory = document.querySelector('.category-link.active');
if (activeCategory) {
  activeCategory.classList.remove('active');
}
const initialServices = servicesData.slice(0, initialItems);
if (initialServices.length < initialItems) {
  const loadMoreBtn = document.getElementById('load-more-btn');
  loadMoreBtn.style.display = 'none';
}
displayServiceCards(initialServices);
}


const categoryLinks = document.querySelectorAll('.category-link');
categoryLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Clicked a category link');
    
    // Remove 'active' class from all category buttons
    categoryLinks.forEach(category => {
      category.classList.remove('active');
    });

    // Add 'active' class to the clicked category button
    this.classList.add('active');

    // Get the selected category from the clicked button's data-category attribute
    const selectedCategory = this.getAttribute('data-category');

    // Filter the servicesData based on the selected category
    const filteredServices = selectedCategory
      ? servicesData.filter(service => service.category === selectedCategory)
      : servicesData;

    // Display the filtered service cards
    displayServiceCards(filteredServices);
  });
});

$(document).ready(function() {
  console.log('jQuery is working.');

  fetchServicesData();

  
  $('.category-link').click(function(e) {
    e.preventDefault();
    console.log('Clicked a category link');
    $('.category-link').removeClass('active');
    $(this).addClass('active');
    const selectedCategory = $(this).data('category');
  
    if ($(this).hasClass('see-all')) { // Handle "See All" click
      resetContent();
    } else {
      const filteredServices = servicesData.filter(service => service.category === selectedCategory);
      displayServiceCards(filteredServices);
    }
  });
  

const loadMoreBtn = document.getElementById('load-more-btn');
loadMoreBtn.addEventListener('click', toggleLoadMore);

displayServiceCards(servicesData.slice(0, initialItems));

});

// Inside your handleCardClick function
function handleCardClick(serviceId) {
  //const clickedService = servicesData.find(service => service.id === serviceId);
  // if (clickedService) {
  //   // Check if the service has a visit count stored in local storage
  //   const storedVisits = localStorage.getItem(`service_${serviceId}_visits`);
  //   const visits = storedVisits ? parseInt(storedVisits) : 0;

  //   const newVisits = visits + 1;

  //   localStorage.setItem(`service_${serviceId}_visits`, newVisits.toString());

  //   // Update the progress value based on your logic
  //   clickedService.progress = newVisits; // Set progress to the number of visits

  //   // Update the total visits count and progress bar
  //   totalVisits++;
  //   updateProgressBar();
  // }
  console.log("Service: " + serviceId);
  addVisited(serviceId);
}


function updateProgressBar() {
  const progress = (totalVisits / MAX_VISITS) * 100;
  const progressBar = document.querySelector('.progress-bar');
  progressBar.style.width = `${progress}%`;
  
  const visitsNumber = document.querySelector('.chart-progress-indicator__number');
  visitsNumber.textContent = totalVisits;
}

function addVisited(serviceId) {
  const accessToken = localStorage.getItem('access_token');

  // Return a Promise
  return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/visit-place/${serviceId}/user`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
  })
  .then(response => {
    if (!response.ok) {
      console.log("DATA1 " + JSON.stringify(response.json()));
      throw new Error('Network response was not ok');
    }
    return response.json(); // Parse the response body as JSON
  })
  .then(data => {
   
  })
  .catch(error => {
    console.log("DATA: " + JSON.stringify(error));
    // alert('Error adding to favorites: ' + error);
    throw error; // Rethrow the error to be handled later if needed
  });
}