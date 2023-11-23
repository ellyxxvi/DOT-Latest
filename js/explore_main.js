const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category');


let totalVisits = 0;
const MAX_VISITS = 100;
const servicesData = []; 

const iconMappings = {
  'swim': 'fas fa-water',
  'nature': 'fas fa-leaf',
  'tourists': 'fas fa-map-marker-alt',
  'resort': 'fas fa-hotel',
  'churches': 'fas fa-church',
  'events': 'fas fa-calendar-days',
};

function generateServiceCard(service) {
  const iconClass = iconMappings[service.category] || 'fas fa-map-marker-alt';

  const words = service.description.split(" ");
  const truncatedDescription = words.length > 15 ?
    words.slice(0, 15).join(" ") + "..." :
    service.description;

  const firstImage = service.backgroundImage[0] || ''; 

  return `
    <div class="column card-link" service-id="${service.id}">
      <a href="explore_cardcontent.php?id=${service.id}">
        <div class="card">
          <div class="background-image" style="background-image: url('${firstImage}');"></div>
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
  loadMoreBtn.style.display = 'block'; 
} else if (currentPage * itemsPerPage + initialItems < servicesData.length) {
  loadMoreBtn.textContent = 'Load More';
  loadMoreBtn.style.display = 'block'; 
} else {
  loadMoreBtn.style.display = 'none'; 
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

}



function toggleLoadMore() {
const activeCategory = document.querySelector('.category-link.active');
const selectedCategory = activeCategory ? activeCategory.getAttribute('data-category') : null;

const filteredServices = selectedCategory
  ? servicesData.filter(service => service.category === selectedCategory)
  : servicesData;

if (currentPage * itemsPerPage + initialItems >= filteredServices.length) {
  currentPage = 0; 
} else {
  currentPage++;
}

displayServiceCards(filteredServices);
}


const contentContainer = document.getElementById('load-more-btn');
contentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });


function resetContent() {
  
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

    categoryLinks.forEach(category => {
      category.classList.remove('active');
    });

    this.classList.add('active');

    const selectedCategory = this.getAttribute('data-category');

    const filteredServices = selectedCategory
      ? servicesData.filter(service => service.category === selectedCategory)
      : servicesData;

    displayServiceCards(filteredServices);
  });
});

$(document).ready(function() {

  // Function to fetch services data and return a promise
  function fetchServicesData() {
    return fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places`)
      .then(response => response.json())
      .then(data => {
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
      })
      .catch(error => console.error('Error fetching data:', error));
  }

  // Fetch data from the server and then process it
  fetchServicesData().then(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');

    // Check if a category is specified in the URL
    if (categoryFromUrl) {
      // Filter and display cards for the specified category
      const filteredServices = servicesData.filter(service => service.category === categoryFromUrl);
      displayServiceCards(filteredServices);
    } else {
      // Display initial set of cards
      displayServiceCards(servicesData.slice(0, initialItems));
    }
  });

  // Category link click handler
  $('.category-link').click(function(e) {
    e.preventDefault();
    $('.category-link').removeClass('active');
    $(this).addClass('active');
    const selectedCategory = $(this).data('category');
  
    if ($(this).hasClass('see-all')) {
      resetContent();
    } else {
      const filteredServices = servicesData.filter(service => service.category === selectedCategory);
      displayServiceCards(filteredServices);
    }
  });

  // Load More button click handler
  const loadMoreBtn = document.getElementById('load-more-btn');
  loadMoreBtn.addEventListener('click', toggleLoadMore);
});


function updateProgressBar() {
  const progress = (totalVisits / MAX_VISITS) * 100;
  const progressBar = document.querySelector('.progress-bar');
  progressBar.style.width = `${progress}%`;
  
  const visitsNumber = document.querySelector('.chart-progress-indicator__number');
  visitsNumber.textContent = totalVisits;
}
