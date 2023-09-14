$(document).ready(function () {
    const itemsPerPage = 3;
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

    function loadGalleryItems(dataToRender) {
        const endIndex = Math.min(startIndex + itemsPerPage, dataToRender.length);
        const itemsToLoad = dataToRender.slice(startIndex, endIndex);

        itemsToLoad.forEach(item => {
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

        startIndex += itemsToLoad.length;

        if (startIndex >= dataToRender.length) {
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
    }

    function loadFilteredGallery() {
        galleryContainer.empty();
        startIndex = 0;

        loadGalleryItems(filteredData);
    }

    // Search button click event
    $('.search button').click(function () {
        const searchInput = $('.search input').val().toLowerCase();
        filteredData = data.filter(item => {
            return item.title.toLowerCase().includes(searchInput) || item.city.toLowerCase().includes(searchInput);
        });

        loadFilteredGallery();
    });

    // Load more button click event
    loadMoreButton.click(function () {
        loadGalleryItems(data);
    });

    // Initial loading of gallery items
    fetch('http://localhost:3000/festival')
        .then(response => response.json())
        .then(responseData => {
            data = responseData;
            loadGalleryItems(data);
        })
        .catch(error => console.error('Error fetching data:', error));

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

        filteredData = festivalsToRender;
        loadFilteredGallery();
    }

    function getMonthFromDateString(dateString) {
        // Implement this function if needed
    }
});
