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
  
    function initializeImageGallery(photos) {
      const galleryContainer = document.getElementById('dynamic-gallery');
      const festivalTitleContainer = document.querySelector('.festival-title');
  
      if (galleryContainer && festivalTitleContainer) {
        // Check if there is only one photo
        if (!photos || photos.length <= 1) {
          // Hide the entire image gallery section
          const imageGallerySection = document.querySelector('.image-gallery');
          imageGallerySection.style.display = 'none';
          return;
        }
  
        galleryContainer.innerHTML = '';
  
        for (let index = 1; index <= 4 && index < photos.length; index++) {
          const imageUrl = photos[index];
  
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
        console.error("The 'dynamic-gallery' or 'festival-title' elements were not found in the DOM.");
      }
    }
  
    function populateElements(data) {
      if (data.photos && data.photos.length > 0) {
        console.log(data.photos);
        bgImage.style.backgroundImage = `url('${data.photos[0]}')`;
  
        bgImage.addEventListener('click', () => {
          openBackgroundImage(data.photos[0]);
        });
      } else {
        console.error('No photos found in data.photos');
      }
      overlayTitle.textContent = data.name;
      festivalTitle.textContent = data.name;
      festivalDescription.textContent = data.description;
  
      initializeImageGallery(data.photos);
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
  
    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/featured-things/${itemId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch festival data');
        }
        return response.json();
      })
      .then((data) => {
        // Log the fetched data
        console.log('Fetched Data for Featured Things:', data);
        populateElements(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error.message);
      });
  });
  