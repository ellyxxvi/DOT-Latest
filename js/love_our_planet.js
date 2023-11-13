

const dynamicImages = [
    {
        image: 'image/SombreroIsland.png',
        overlayText: 'EXPLORE THE COUNTRY WHILE PRACTICING SUSTAINABILITY.',
    },
    {
        image: 'image/leaves.jpg',
        overlayText: 'BE A RESPONSIBLE TOURIST.',
    },
    {
        image: 'image/LAMBAYOK5.PNG',
        overlayText: 'RESPECT THE CULTURE <br> RESPECT THE ENVIRONMENT',
    },

];

const container = document.getElementById('dynamic-images-container');

dynamicImages.forEach((item, index) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('bg-image-wrapper', `bg-image-wrapper-${index + 1}`);
    wrapper.style.backgroundImage = `url('${item.image}')`;
    wrapper.style.height = '800px';
    wrapper.style.backgroundRepeat = 'no-repeat';
    wrapper.style.backgroundSize = 'cover';

    const overlay = document.createElement('div');
    overlay.classList.add('col-6', 'overlay');

    const overlayText = document.createElement('h1');
    overlayText.classList.add('overlay-text');
    overlayText.innerHTML = item.overlayText;

    overlay.appendChild(overlayText);
    wrapper.appendChild(overlay);
    container.appendChild(wrapper);
});

// dynamic contents for 3 options
const dynamicOptions = [
    {
      backgroundImage: 'image/what to bring.jpg',
      icon: 'fas',
      icon2: 'fa-suitcase',
      title: 'THINGS TO BRING',
      sectionId: 'thing-to-bring',
    },
    {
      backgroundImage: 'image/what to avoid.jpg',
      icon: 'fas',
      icon2: 'fa-hand-paper',
      title: 'WHAT TO AVOID',
      sectionId: 'what-to-avoid',
    },
    {
      backgroundImage: 'image/what to remember.jpg',
      icon: 'fas',
      icon2: 'fa-lightbulb',
      title: 'STUFF TO REMEMBER',
      sectionId: 'stuff-to-remember',
    },
    
    // Add more objects as needed
  ];
  
  const optionsContainer = document.getElementById('dynamic-options-container');
  
  dynamicOptions.forEach((item) => {
    const optionColumn = document.createElement('div');
    optionColumn.classList.add('col-md-4', 'option-column');
    optionColumn.setAttribute('onclick', `navigateToSection('${item.sectionId}')`);
  
    const option = document.createElement('div');
    option.classList.add('option');
  
    const bgImage = document.createElement('div');
    bgImage.classList.add('bg-image');
    bgImage.style.backgroundImage = `url('${item.backgroundImage}')`;
  
    const icon = document.createElement('div');
    icon.classList.add('icon');
    const iconElement = document.createElement('i');
    iconElement.classList.add(item.icon);
    iconElement.classList.add(item.icon2);
    icon.appendChild(iconElement);
  
    const title = document.createElement('h2');
    title.innerText = item.title;
  
    option.appendChild(bgImage);
    option.appendChild(icon);
    option.appendChild(title);
    optionColumn.appendChild(option);
    optionsContainer.appendChild(optionColumn);
  });
  function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// THINGS TO BRING
const sectionTitle = document.getElementById('section-title');
const slider = document.getElementById('slider');

sectionTitle.innerText = 'THINGS TO BRING'; 

document.addEventListener('DOMContentLoaded', function () {
  fetch(`${API_PROTOCOL}://${API_HOSTNAME}/things-to-bring`)
    .then(response => response.json())
    .then(data => {
      const slider = document.getElementById('slider'); // Assuming you have an element with id 'slider'

      data.forEach(item => {
        const slide = document.createElement('div');
        slide.classList.add('slide');

        const slideImage = document.createElement('div');
        slideImage.classList.add('slide-image');
        slideImage.style.backgroundImage = `url('${item.images}')`;

        const slideDetails = document.createElement('div');
        slideDetails.classList.add('slide-details');

        const slideTitle = document.createElement('h3');
        slideTitle.innerText = item.title;

        const slideDescription = document.createElement('p');
        slideDescription.innerText = item.description;
        slideDescription.classList.add('love-our-planet-p');
        slideDescription.style.margin = '10px 0';
        slideDescription.style.color = '#ffffff';

        const slideLink = document.createElement('a');
        slideLink.href = item.link;
        // slideLink.classList.add('facebook-button');
        // slideLink.innerText = 'Share';

        slideDetails.appendChild(slideTitle);
        slideDetails.appendChild(slideDescription);
        slideDetails.appendChild(slideLink);

        slide.appendChild(slideImage);
        slide.appendChild(slideDetails);

        slider.appendChild(slide);
      });

      // Initialize Slick slider for the "Things to Bring" section
      $('#slider').slick({
        dots: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
            },
          },
        ],
      });
    })
    .catch(error => console.error('Error fetching data:', error));
});


// WHAT TO AVOID
const avoidSectionTitle = document.getElementById('avoid-section-title');
const avoidSlider = document.getElementById('avoid-slider');

avoidSectionTitle.innerText = 'WHAT TO AVOID'; // Set the section title

document.addEventListener('DOMContentLoaded', function () {
  fetch(`${API_PROTOCOL}://${API_HOSTNAME}/things-to-avoid`)
    .then(response => response.json())
    .then(data => {
      const slider = document.getElementById('avoid-slider'); // Assuming you have an element with id 'avoid-slider'

      data.forEach(item => {
        const slide = document.createElement('div');
        slide.classList.add('slide');

        const slideImage = document.createElement('div');
        slideImage.classList.add('slide-image');
        slideImage.style.backgroundImage = `url('${item.images}')`;

        const slideDetails = document.createElement('div');
        slideDetails.classList.add('slide-details');

        const slideTitle = document.createElement('h3');
        slideTitle.innerText = item.title;

        const slideDescription = document.createElement('p');
        slideDescription.innerText = item.description;
        slideDescription.classList.add('love-our-planet-p');
        slideDescription.style.margin = '10px 0';
        slideDescription.style.color = '#ffffff';

        const slideLink = document.createElement('a');
        slideLink.href = item.link;
        // slideLink.classList.add('facebook-button');
        // slideLink.innerText = 'Share';

        slideDetails.appendChild(slideTitle);
        slideDetails.appendChild(slideDescription);
        slideDetails.appendChild(slideLink);

        slide.appendChild(slideImage);
        slide.appendChild(slideDetails);

        slider.appendChild(slide);
      });

      // Initialize Slick slider for the "What to Avoid" section
      $('#avoid-slider').slick({
        dots: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
            },
          },
        ],
      });
    })
    .catch(error => console.error('Error fetching data:', error));
});


// stuff to remember
const dynamicRememberSlides = [];
const rememberSectionTitle = document.getElementById('remember-section-title');
const rememberSlider = document.getElementById('remember-slider');

rememberSectionTitle.innerText = 'STUFF TO REMEMBER'; // Set the section title

document.addEventListener('DOMContentLoaded', function () {
  fetch(`${API_PROTOCOL}://${API_HOSTNAME}/things-to-remember`)
    .then(response => response.json())
    .then(data => {
      dynamicRememberSlides.push(...data); // Add fetched data to the array

      // Loop through the array and create slides
      dynamicRememberSlides.forEach(item => {
        const slide = document.createElement('div');
        slide.classList.add('slide');

        const slideImage = document.createElement('div');
        slideImage.classList.add('slide-image');
        slideImage.style.backgroundImage = `url('${item.images}')`;

        const slideDetails = document.createElement('div');
        slideDetails.classList.add('slide-details');

        const slideTitle = document.createElement('h3');
        slideTitle.innerText = item.title;

        const slideDescription = document.createElement('p');
        slideDescription.innerText = item.description;
        slideDescription.classList.add('love-our-planet-p');
        slideDescription.style.margin = '10px 0';
        slideDescription.style.color = '#ffffff';

        const slideLink = document.createElement('a');
        slideLink.href = item.link;
        // slideLink.classList.add('facebook-button');
        // slideLink.innerText = 'Share';

        slideDetails.appendChild(slideTitle);
        slideDetails.appendChild(slideDescription);
        slideDetails.appendChild(slideLink);

        slide.appendChild(slideImage);
        slide.appendChild(slideDetails);

        rememberSlider.appendChild(slide);
      });

      // Initialize Slick slider for the "What to Avoid" section
      $('#remember-slider').slick({
        dots: true,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
            },
          },
        ],
      });
    })
    .catch(error => console.error('Error fetching data:', error));
});
