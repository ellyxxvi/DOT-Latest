// LEARN MORE DYNAMIC CONTENTS
const learnmoreContainer = document.getElementById("learnmore-container");

function generateLearnmoreItem(imageSrc, text) {
    const divCol = document.createElement("div");
    divCol.classList.add("col", "col-12", "p-0");
    const learnmoreItem = document.createElement("div");
    learnmoreItem.classList.add("learnmore-item");

    const learnmoreImage = document.createElement("div");
    learnmoreImage.classList.add("learnmore-image");
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = "Image";

    learnmoreImage.appendChild(img);

    const learnmoreContent = document.createElement("div");
    learnmoreContent.classList.add("learnmore-content");
    const learnmoreText = document.createElement("div");
    learnmoreText.classList.add("learnmore-text");
    learnmoreText.textContent = text;

    learnmoreContent.appendChild(learnmoreText);
    learnmoreItem.appendChild(learnmoreImage);
    learnmoreItem.appendChild(learnmoreContent);
    divCol.appendChild(learnmoreItem);

    learnmoreText.style.padding = "0 100px";
    learnmoreText.style.textAlign = "center";

    learnmoreContainer.appendChild(divCol);
}


// Fetch data from the admin side and generate content
fetch(`${API_PROTOCOL}://${API_HOSTNAME}/learn-more`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Check the content type of the response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not in JSON format.');
    }
    return response.json();
  })
  .then(data => {
    data.forEach(item => {
      generateLearnmoreItem(item.images, item.description);
    });
  })
  .catch(error => {
    console.error('Error fetching or processing data:', error.message);
    // Handle the error gracefully, e.g., by displaying an error message to the user
  });
