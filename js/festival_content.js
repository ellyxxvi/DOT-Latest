
// Find the elements to populate
const bgImage = document.querySelector('.bg-image');
const overlayTitle = document.querySelector('.overlay-title');
const festivalTitle = document.querySelector('.festival-title');
const festivalDescription = document.querySelector('.festival-description');

function populateElements(data) {
    bgImage.style.backgroundImage = `url('${data.image}')`; 
    overlayTitle.textContent = data.title; 
    festivalTitle.textContent = data.title;
    festivalDescription.textContent = data.description;
}

const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('item_id');

fetch(`http://localhost:3000/festival/${itemId}`)
    .then(response => response.json())
    .then(data => {

        populateElements(data);
    })
    .catch(error => console.error('Error fetching data:', error));



// Find the element where you want to insert the content
const carouselInner = document.querySelector('.carousel-inner');

// Fetch data from the database endpoint
fetch('http://localhost:3000/places')
    .then(response => response.json())
    .then(data => {
        const hotelsData = data.filter(item => item.category === 'hotels');

        for (let i = 0; i < hotelsData.length; i += 3) {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');

            const row = document.createElement('div');
            row.classList.add('row');

            for (let j = i; j < i + 3 && j < hotelsData.length; j++) {
                const col = document.createElement('div');
                col.classList.add('col-md-4', 'mb-3');

                const link = document.createElement('a');
                link.href = 'explore_cardcontent.php?id=' + hotelsData[j].id;
                link.style.textDecoration = 'none';
                link.style.color = 'black';

                const card = document.createElement('div');
                card.classList.add('card');

                const img = document.createElement('img');
                img.classList.add('img-fluid');
                img.alt = '100%x280';
                img.src = hotelsData[j].image;

                const cardBody = document.createElement('div');
                cardBody.classList.add('card-body');

                const title = document.createElement('h4');
                title.classList.add('card-title');
                title.textContent = hotelsData[j].title;

                const city = document.createElement('p');
                city.classList.add('card-text');
                city.textContent = hotelsData[j].city;

                cardBody.appendChild(title);
                cardBody.appendChild(city);
                card.appendChild(img);
                card.appendChild(cardBody);
                link.appendChild(card);
                col.appendChild(link);
                row.appendChild(col);
            }

            carouselItem.appendChild(row);

            if (i === 0) {
                carouselItem.classList.add('active');
            }

            carouselInner.appendChild(carouselItem);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
