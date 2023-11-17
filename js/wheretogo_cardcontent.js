
function openBackgroundImage(imageUrl) {
  if (imageUrl) {
    $.magnificPopup.open({
      items: {
        src: imageUrl
      },
      type: 'image'
    });
  } else {
    console.error('Background image URL is empty.');
  }
}

function fetchDynamicData() {
  const queryParams = new URLSearchParams(window.location.search);
  const cityId = queryParams.get('id');
  const url = `${API_PROTOCOL}://${API_HOSTNAME}/where-to-go/${cityId}`;

  return fetch(url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    })
    .then(function(data) {

      updateDynamicElements(data);
    })
    .catch(function(error) {
      console.error('Error fetching data:', error);
      return []; 
    });
}

function updateDynamicElements(selectedData) {
  const backgroundElement = document.querySelector(".background-image");
  const titleElement = document.querySelector("h3");
  const paragraphElement = document.querySelector(".dynamic-paragraph");


  if (selectedData && selectedData.images) {

    backgroundElement.style.backgroundImage = `url('${selectedData.images}')`;


    backgroundElement.addEventListener('click', function() {
      openBackgroundImage(selectedData.images);
    });


    titleElement.textContent = selectedData.title;
    paragraphElement.textContent = selectedData.description;
  } else {

    console.error('Selected data not found or images are undefined.');
  }
}

fetchDynamicData();
