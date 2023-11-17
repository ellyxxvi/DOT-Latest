$(document).ready(function () {
    const itemsPerPage = 6;
    let startIndex = 0;
    let placeData;
    const maxRecentSearches = 5; 
    const recentSearchesKey = 'recentSearches';

    const galleryContainer = $('.image-gallery');
    const loadMoreButton = $('.load-more');
    const galleryItemLinks = document.querySelectorAll('.gallery-item-link');
    const searchInput = $('.search input');
    const searchButton = $('.search button');
    const recentSearchesDropdown = $('.recent-searches');

    function handleGalleryItemClick(event, itemId) {
        event.preventDefault();

        const clickedPlace = placeData.find(place => place.id === itemId);

        if (clickedPlace) {
            populateElements({
                imageSrc: clickedPlace.photos,
                overlayTitle: clickedPlace.title,
                placeTitle: clickedPlace.title,
                placeDescription: clickedPlace.description,
            });
        }
    }

    function populateElements(data) {
        // Implement this function if needed
    }

    function loadGalleryItems(dataToRender) {
        const copy = [];
        dataToRender[0].forEach(function (item) {
            copy.push(item);
        });

    const endIndex = Math.min(startIndex + itemsPerPage, copy.length);

    if (Array.isArray(dataToRender)) {
        var test = Object.entries(dataToRender[0]);

        const itemsToLoad = copy.slice(startIndex, endIndex);
        console.log("Item: "+ JSON.stringify(itemsToLoad));
        itemsToLoad.forEach(item => {
            console.log("Item2: "+ JSON.stringify(item));
            const imageSrc = item.photos ? item.photos[0] : ''; 
            const title = item.title || '';
            const placeTitle = item.placeTitle || '';
            const city = item.city || '';

            const itemHtml = `
                <a href="explore_cardcontent.php?id=${item.id}" class="gallery-item-link" data-item-id="${item.id}">
                    <div class="gallery-item">
                        <div class="image-wrapper">
                            <img src="${imageSrc}" alt="Image ${item.id}" class="place-image">
                        </div>
                        <div class="item-overlay">
                            <h3>${title}</h3>
                            ${placeTitle ? `<p>${placeTitle}</p>` : ''}
                            <p>${city}</p>
                        </div>
                    </div>
                </a>
            `;
            galleryContainer.append(itemHtml);
        });

        startIndex += itemsToLoad.length;

        if (startIndex >= copy.length) {
            loadMoreButton.hide();
        } else {
            loadMoreButton.show();
        }
    } else {
        console.error('Data to render is not an array:', copy);
    }
}

    function saveRecentSearch(query) {
        const recentSearches = getRecentSearches();
        if (recentSearches.includes(query)) {
            const index = recentSearches.indexOf(query);
            recentSearches.splice(index, 1);
        } else if (recentSearches.length >= maxRecentSearches) {
            recentSearches.pop();
        }
        recentSearches.unshift(query); 
        localStorage.setItem(recentSearchesKey, JSON.stringify(recentSearches));
    }

    function getRecentSearches() {
        const storedSearches = localStorage.getItem(recentSearchesKey);
        return storedSearches ? JSON.parse(storedSearches) : [];
    }

    function displayRecentSearches() {
        const recentSearches = getRecentSearches();
        recentSearchesDropdown.empty();
        if (recentSearches.length > 0) {
            recentSearchesDropdown.append('<p>Recent Searches:</p>');
            recentSearches.forEach(query => {
                const recentSearchItem = $('<div class="recent-search-item"></div>');
                recentSearchItem.text(query);
                recentSearchItem.click(function () {
                    searchInput.val(query);
                    searchButton.click();
                });
                recentSearchesDropdown.append(recentSearchItem);
            });
            recentSearchesDropdown.show(); 
        } else {
            recentSearchesDropdown.hide();
        }
    }

    displayRecentSearches();

    searchInput.click(function () {
        displayRecentSearches(); 
    });

    searchButton.click(function () {
        const searchValue = searchInput.val().toLowerCase();

        if (searchValue.trim() !== '') {
            saveRecentSearch(searchValue);

            fetchPlacesBySearchValue(searchValue);
        }
    });


    loadMoreButton.click(function () {
        loadGalleryItems(placeData);
    });

    function fetchPlacesBySearchValue(searchValue) {
        fetch(`${API_PROTOCOL}://${API_HOSTNAME}/search/place?q=${searchValue}`)
            .then(response => response.json())
            .then(responseData => {
                placeData = [responseData.searchedPlaces];
                loadGalleryItems(placeData);
            })
            .catch(error => console.error('Error fetching place data:', error));
    }
    
    // fetch(`${API_PROTOCOL}://${API_HOSTNAME}/places`)
    //         .then(response => response.json())
    //         .then(responseData => {
    //             placeData = [responseData];
    //             loadGalleryItems(placeData);
    //         })
    //         .catch(error => console.error('Error fetching place data:', error));
});
