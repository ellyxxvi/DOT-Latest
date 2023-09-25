

// Function to fetch dynamic data from the server
function fetchDynamicData() {
    // Get the 'id' parameter from the URL query string
  const queryParams = new URLSearchParams(window.location.search);
  const cityId = queryParams.get('id');
  const url = `${API_PROTOCOL}://${API_HOSTNAME}/where-to-go/${cityId}`;


 return fetch(url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Use response.json() to parse the JSON data
      return response.json();
    })
    .then(function(data) {
      // Now 'data' is a JavaScript object containing the JSON response
      console.log("Response Data: ", data);
      updateDynamicElements(data);
    })
    .catch(function(error) {
      console.error('Error fetching data:', error);
      return []; // Return an empty array in case of an error
    });
}

// Function to update dynamic elements on the webpage
function updateDynamicElements(selectedData) {
  const backgroundElement = document.querySelector(".background-image");
  const titleElement = document.querySelector("h3");
  const paragraphElement = document.querySelector(".dynamic-paragraph");

  // Check if selectedData is not null or undefined
  if (selectedData) {
    backgroundElement.style.backgroundImage = `url('${selectedData.images}')`;
    titleElement.textContent = selectedData.title;
    paragraphElement.textContent = selectedData.description;
  } else {
    // Handle the case when selectedData is not found
    console.error('Selected data not found.');
  }
}


fetchDynamicData();
