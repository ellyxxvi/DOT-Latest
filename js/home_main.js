const token = localStorage.getItem('access_token');
if (!token) {
  // If not logged in, hide the recommended iframe
  const recommendedIframe = document.getElementById('recommendedIframe');
  if (recommendedIframe) {
    recommendedIframe.style.display = 'none';
  }
}
const video = document.getElementById('video');

video.addEventListener('click', function () {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});
async function fetchSeasonsData() {
  try {
      console.log('Fetching seasons data...');
      const response = await fetch(`${API_PROTOCOL}://${API_HOSTNAME}/seasons`);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const seasonsData = await response.json();
      console.log('Seasons data:', seasonsData);
      return seasonsData;
  } catch (error) {
      console.error('Error fetching seasons data:', error);
      return [];
  }
}

async function updateSeasonInfo() {
  try {
      const seasonsData = await fetchSeasonsData();

      if (seasonsData.length === 0) {
          console.error('No seasons data found.');
          return;
      }

      // Find the current season based on the current date
      const currentDate = new Date();
      const currentMonthDay = currentDate.toISOString().slice(5, 10); // Get only MM-DD format

      const currentSeason = seasonsData.find(season => {
          const fromMonthDay = season.from_date.slice(5, 10);
          const toMonthDay = season.to_date.slice(5, 10);

          // Handle the case where the season spans the end of the year
          if (fromMonthDay <= toMonthDay) {
              return currentMonthDay >= fromMonthDay && currentMonthDay <= toMonthDay;
          } else {
              // Season spans the end of the year (e.g., Dec 25 to Jan 5)
              return currentMonthDay >= fromMonthDay || currentMonthDay <= toMonthDay;
          }
      });

      if (!currentSeason) {
          console.error('No matching season found for the current date.');
          return;
      }

      // Update the season title and description
      const seasonTitleElement = document.getElementById('seasonTitle');
      const seasonDescriptionElement = document.getElementById('seasonDescription');

      seasonTitleElement.textContent = currentSeason.name.toUpperCase();
      seasonDescriptionElement.innerHTML = `<i>${currentSeason.description}</i>`;
  } catch (error) {
      console.error('Error updating season info:', error);
  }
}

// Call the function to update season info when the DOM is loaded
document.addEventListener('DOMContentLoaded', updateSeasonInfo);
