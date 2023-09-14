$(document).ready(function () {
    const itemsPerPage = 6;
    let startIndex = 0;
    let data;
    let filteredData;

    const galleryContainer = $('.image-gallery');
    const loadMoreButton = $('.load-more');
    const galleryItemLinks = document.querySelectorAll('.gallery-item-link');

    // Function to handle the click event on gallery items
    function handleGalleryItemClick(event, itemId) {
        event.preventDefault();

        // Find the matching festival data using item's id
        const clickedFestival = data.find(festival => festival.id === itemId);

        if (clickedFestival) {
            // Update the template with the clicked item's details
            populateElements({
                imageSrc: clickedFestival.image,
                overlayTitle: clickedFestival.title,
                festivalTitle: clickedFestival.title,
                festivalDescription: clickedFestival.description,
            });
        }
    }

    // Function to populate the template with dynamic content
    function populateElements(data) {
        // Implement this function if needed
    }

    function loadGalleryItems() {
        fetch('http://localhost:3000/festival')
            .then(response => response.json())
            .then(responseData => {
                data = responseData;
    
                const galleryItems = data.slice(startIndex, startIndex + itemsPerPage);
    
                galleryItems.forEach(item => {
                    // Build and append gallery item HTML
                    const itemHtml = `
                        <a href="festival_content.php?item_id=${item.id}" class="gallery-item-link" data-item-id="${item.id}">
                            <div class="gallery-item">
                                <div class="image-wrapper">
                                    <img src="${item.image}" alt="Image ${item.id}">
                                </div>
                                <div class="item-overlay">
                                    <div class="calendar-icon">
                                        <i class="fas fa-calendar"></i>
                                        <span class="month">${item.date}</span>
                                    </div>
                                    <h3>${item.title}</h3>
                                    <p>${item.city}</p>
                                </div>
                            </div>
                        </a>
                    `;
                    galleryContainer.append(itemHtml);
                });
    
                startIndex += itemsPerPage;
    
                if (startIndex >= data.length) {
                    loadMoreButton.hide();
                } else {
                    loadMoreButton.show();
                }
    
                galleryItemLinks.forEach(link => {
                    link.addEventListener('click', event => {
                        event.preventDefault();
                        const itemId = parseInt(link.getAttribute('data-item-id'));
                        window.location.href = `festival_content.php?item_id=${itemId}`;
                    });
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Load more button click event
    loadMoreButton.click(function () {
        loadGalleryItems();
    });

    // Initial loading of gallery items
    loadGalleryItems();

    // month-dropdown
    $("#monthDropdown").change(function () {
        var selectedMonth = $(this).val();
        updateCalendar(selectedMonth);
    });

    function updateCalendar(month) {
        galleryContainer.empty();

        let festivalsToRender = (month === 'all') ? data : data.filter(festival => {
            const festivalMonth = getMonthFromDateString(festival.date);
            return festivalMonth === parseInt(month);
        });

        const currentlyDisplayedItems = galleryContainer.find('.gallery-item').length;
        startIndex = currentlyDisplayedItems;

        // startIndex = 0;
        loadMoreButton.show();
        
        festivalsToRender.slice(startIndex, startIndex + itemsPerPage).forEach(item => {
            const itemHtml = `
                <a href="festival_content.php?item_id=${item.id}" class="gallery-item-link" data-item-id="${item.id}">
                    <div class="gallery-item">
                        <div class="image-wrapper">
                            <img src="${item.image}" alt="Image ${item.id}">
                        </div>
                        <div class="item-overlay">
                            <div class="calendar-icon">
                                <i class="fas fa-calendar"></i>
                                <span class="month">${item.date}</span>
                            </div>
                            <h3>${item.title}</h3>
                            <p>${item.city}</p>
                        </div>
                    </div>
                </a>
            `;
            galleryContainer.append(itemHtml);
        });
        
        startIndex += itemsPerPage;
        if (startIndex >= festivalsToRender.length) {
            loadMoreButton.hide();
        }
    }

    // Manually trigger the change event for the initial month
    $("#monthDropdown").trigger("change");

    function getMonthFromDateString(dateString) {
        const date = new Date(dateString);
        return date.getMonth() + 1;
    }
});

// INCOMING FESTIVAL
const carouselInner = document.querySelector('.carousel-inner');

function populateCarousel() {
    fetch('http://localhost:3000/festival')
        .then(response => response.json())
        .then(data => {
            const currentDate = new Date();
            const incomingFestivals = data.filter(festival => {
                const festivalDate = new Date(festival.date);
                return (
                    (festivalDate.getMonth() === currentDate.getMonth() && festivalDate.getDate() >= currentDate.getDate()) ||
                    festivalDate.getMonth() > currentDate.getMonth()
                );
            });

            for (let i = 0; i < incomingFestivals.length; i += 3) {
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');

                const row = document.createElement('div');
                row.classList.add('row');

                for (let j = i; j < i + 3 && j < incomingFestivals.length; j++) {
                    const col = document.createElement('div');
                    col.classList.add('col-md-4', 'mb-3');

                    const link = document.createElement('a');
                    link.href = `festival_content.php?item_id=${incomingFestivals[j].id}`;
                    link.style.textDecoration = 'none';
                    link.style.color = 'black';

                    const card = document.createElement('div');
                    card.classList.add('card');

                    const img = document.createElement('img');
                    img.classList.add('img-fluid');
                    img.alt = '100%x280';
                    img.src = incomingFestivals[j].image;

                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');

                    const title = document.createElement('h4');
                    title.classList.add('card-title');
                    title.textContent = incomingFestivals[j].title;

                    const city = document.createElement('p');
                    city.classList.add('card-text');
                    city.textContent = incomingFestivals[j].city;

                    // Append elements to create the card structure
                    cardBody.appendChild(title);
                    cardBody.appendChild(city);
                    card.appendChild(img);
                    card.appendChild(cardBody);
                    link.appendChild(card);
                    col.appendChild(link);
                    row.appendChild(col);
                }

                carouselItem.appendChild(row);

                // Set the first item as active
                if (i === 0) {
                    carouselItem.classList.add('active');
                }

                // Append the carousel item to the carousel inner
                carouselInner.appendChild(carouselItem);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

populateCarousel();
