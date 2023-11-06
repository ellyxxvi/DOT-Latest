$(document).ready(function () {
    const itemsPerPage = 6;
    let startIndex = 0;
    let data;

    const galleryContainer = $('.image-gallery');
    const loadMoreButton = $('.load-more');
    const galleryItemLinks = document.querySelectorAll('.gallery-item-link');

    // Function to handle the click event on gallery items
    function handleGalleryItemClick(event, itemId) {
        event.preventDefault();

        // Find the matching festival data using the item's id
        const clickedFestival = data.find(festival => festival.id === itemId);

        if (clickedFestival) {
            // Update the template with the clicked item's details
            populateElements({
                imageSrc: clickedFestival.images[0], // Display the first image URL
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
        fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(responseData => {
                // Assuming item.date is in a format that can be understood by Date.parse(), like "YYYY-MM-DD"
                responseData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
                data = responseData;
    
                const galleryItems = data.slice(startIndex, startIndex + itemsPerPage);
    
                galleryItems.forEach(item => {
                    // Format the date using formatDateToMonthAndDay function
                    const formattedDate = formatDateToMonthAndDay(item.date);
    
                    // Build and append gallery item HTML
                    const itemHtml = `
                        <a href="festival_content.php?item_id=${item.id}" class="gallery-item-link" data-item-id="${item.id}">
                            <div class="gallery-item">
                                <div class="image-wrapper">
                                    <img src="${item.images[0]}" alt="Image ${item.id}">
                                </div>
                                <div class="item-overlay">
                                    <div class="calendar-icon">
                                        <i class="fas fa-calendar"></i>
                                        <span class="month">${formattedDate}</span>
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
    
                // Make sure galleryItemLinks is a fresh collection of links
                galleryItemLinks = document.querySelectorAll('.gallery-item-link');
    
                galleryItemLinks.forEach(link => {
                    $(link).on('click', function (event) {
                        handleGalleryItemClick(event, parseInt($(this).data('item-id')));
                    });
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }
    

    // Function to format a date to "Month Day" format
    function formatDateToMonthAndDay(dateString) {
        const date = new Date(dateString);
        const options = { month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
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

        // Ensure data is defined and not null before filtering
        if (data) {
            let festivalsToRender = (month === 'all') ? data : data.filter(festival => {
                const festivalMonth = getMonthFromDateString(festival.date);
                return festivalMonth === parseInt(month);
            });

            const currentlyDisplayedItems = galleryContainer.find('.gallery-item').length;
            startIndex = currentlyDisplayedItems;

            loadMoreButton.show();

            festivalsToRender.slice(startIndex, startIndex + itemsPerPage).forEach(item => {
                const formattedDate = formatDateToMonthAndDay(item.date); // Format the date here
                const itemHtml = `
                    <a href="festival_content.php?item_id=${item.id}" class="gallery-item-link" data-item-id="${item.id}">
                        <div class "gallery-item">
                            <div class="image-wrapper">
                                <img src="${item.images[0]}" alt="Image ${item.id}"> 
                            </div>
                            <div class="item-overlay">
                                <div class="calendar-icon">
                                    <i class="fas fa-calendar"></i>
                                    <span class="month">${formattedDate}</span>
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
    }

    // Manually trigger the change event for the initial month
    $("#monthDropdown").trigger("change");

    function getMonthFromDateString(dateString) {
        const date = new Date(dateString);
        return date.getMonth() + 1;
    }
});


const carouselInner = document.querySelector('.carousel-inner');

function populateCarousel() {
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
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
                    img.src = incomingFestivals[j].images[0]; // Display the first image URL

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
