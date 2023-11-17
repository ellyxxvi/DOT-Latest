document.addEventListener('DOMContentLoaded', function () {
  const bgImage = document.querySelector('.bg-image');
  const overlayTitle = document.querySelector('.overlay-title');
  const festivalTitle = document.querySelector('.festival-title');
  const festivalDescription = document.querySelector('.festival-description');

  function openBackgroundImage(imageUrl) {
    if (imageUrl) {
      $.magnificPopup.open({
        items: {
          src: imageUrl,
        },
        type: 'image',
        mainClass: 'mfp-img-mobile',
        image: {
          tError: '<a href="%url%">The image could not be loaded.',
        },
      });
    } else {
      console.error('Background image URL is empty.');
    }
  }

  function initializeImageGallery(imageUrls) {
    const galleryContainer = document.getElementById('dynamic-gallery');
    if (galleryContainer) {
      galleryContainer.innerHTML = '';

      for (let index = 1; index <= 4 && index < imageUrls.length; index++) {
        const imageUrl = imageUrls[index];

        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-xs-6 thumb';

        const link = document.createElement('a');
        link.href = imageUrl;

        const figure = document.createElement('figure');

        const image = document.createElement('img');
        image.className = 'img-fluid img-thumbnail';
        image.src = imageUrl;
        image.alt = `Image ${index + 1}`;

        image.style.width = '250px';
        image.style.height = '200px';
        image.style.objectFit = 'cover';

        figure.appendChild(image);
        link.appendChild(figure);
        col.appendChild(link);

        galleryContainer.appendChild(col);
      }

      $(".gallery").magnificPopup({
        delegate: "a",
        type: "image",
        tLoading: "Loading image #%curr%...",
        mainClass: "mfp-img-mobile",
        gallery: {
          enabled: true,
          navigateByImgClick: false,
          preload: [0, 1],
        },
        image: {
          tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
        },
      });
    } else {
      console.error("The 'dynamic-gallery' element was not found in the DOM.");
    }
  }

  function populateElements(data) {
    if (data.images && data.images.length > 0) {
      console.log(data.images);
      bgImage.style.backgroundImage = `url('${data.images[0]}')`;

      bgImage.addEventListener('click', () => {
        openBackgroundImage(data.images[0]);
      });
    } else {
      console.error('No images found in data.images');
    }
    overlayTitle.textContent = data.title;
    festivalTitle.textContent = data.title;
    festivalDescription.textContent = data.description;

    initializeImageGallery(data.images);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('item_id');

  fetch(`${API_PROTOCOL}://${API_HOSTNAME}/events/${itemId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch festival data');
      }
      return response.json();
    })
    .then((data) => {
      populateElements(data);
    })
    .catch((error) => {
      console.error('Error fetching data:', error.message);
    });
});
