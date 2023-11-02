document.addEventListener("DOMContentLoaded", function () {
  const favoritesButton = document.getElementById("favoritesButton");
  const visitedButton = document.getElementById("visitedButton");
  const accountButton = document.getElementById("accountButton");
  const builderButton = document.getElementById("builderButton");

  favoritesButton.addEventListener("click", function () {
    window.location.href = "itinerary_favorites.php";
  });

  visitedButton.addEventListener("click", function () {
    window.location.href = "itinerary_visited.php";
  });

  accountButton.addEventListener("click", function () {
    window.location.href = "user-profile.php";
  });

  builderButton.addEventListener("click", function () {
    window.location.href = "itinerary-builder.php";
  });

  const images = [
    'image/places/churches.png',
    'image/places/hotels.png',
    'image/places/naturetrip.png',
    // Add more image URLs as needed
  ];

  const carouselInner = document.querySelector('.carousel-inner');

  images.forEach((imageUrl, index) => {
    const carouselItem = document.createElement('div');
    carouselItem.classList.add('carousel-item');
    if (index === 0) {
      carouselItem.classList.add('active');
    }
    const image = document.createElement('img');
    image.src = imageUrl;
    image.classList.add('d-block', 'w-100', 'vh-100', 'object-fit-cover');
    carouselItem.appendChild(image);
    carouselInner.appendChild(carouselItem);
  });

  // Initialize the event data array
  const eventData = [];

  // Function to add an event to the calendar
  function addEventToCalendar(eventData) {
    jQuery('#calendar').fullCalendar('renderEvent', eventData);
  }

  // Check if the user is logged in
  const isLoggedIn = localStorage.getItem('access_token') !== null;

  if (isLoggedIn) {
    const access_token = localStorage.getItem('access_token');
    
    jQuery(document).ready(function () {
      console.log('Document is ready.');
      
      // Initialize the datetimepicker
      jQuery('.datetimepicker').datepicker({
        language: 'en',
        timepicker: true,
        range: true,
        multipleDates: true,
        multipleDatesSeparator: " - ",
      });
      console.log('Datepicker initialized.');
      
      jQuery('#calendar').fullCalendar({
        themeSystem: 'bootstrap4',
        businessHours: false,
        defaultView: 'month',
        editable: true,
        header: {
          left: 'title',
          right: 'today prev,next'
        },
        events: eventData,
        eventRender: function (event, element) {
          if (event.icon) {
            element.find(".fc-title").prepend("<i class='fa fa-" + event.icon + "'></i>");
          }
        },
        dayClick: function (date, jsEvent, view) {
          jQuery('#modal-view-event-add').modal('show');
        },
        eventClick: function (event, jsEvent, view) {
          jQuery('.event-icon').html("<i class='fa fa-" + event.icon + "'></i>");
          jQuery('.event-title').html(event.title);
          jQuery('.event-body').html(event.description);
          jQuery('.eventUrl').attr('href', event.url);
          jQuery('#modal-view-event').modal('show');
        },
      });

      const placeNameDropdown = document.getElementById("place_name");

      function fetchFavoritePlaces() {
        const userId = localStorage.getItem('user_id');

        if (!userId) {
          console.error('User ID not found in local storage');
          return;
        }

        const favoritesApiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/itineraries/items/`;

        fetch(favoritesApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + access_token,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then((data) => {
            placeNameDropdown.innerHTML = '';

            data.forEach((place) => {
              const option = document.createElement('option');
              option.value = place.id;
              option.textContent = place.title;
              placeNameDropdown.appendChild(option);
            });
          })
          .catch((error) => {
            console.error('Error fetching favorite places:', error);
          });
      }

      fetchFavoritePlaces();

      // Submit the form to add an event
      jQuery("#add-event").submit(function (event) {
        event.preventDefault();

        var formData = {
          place_name: placeNameDropdown.value, 
          event_date: jQuery('#event_date').val(),
          notes: jQuery('#notes').val(),
          event_color: jQuery('#event_color').val(),
          event_icon: jQuery('#event_icon').val(),
        };

        var apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/itinerary-builder`;

        jQuery.ajax({
          url: apiUrl,
          type: 'POST',
          data: JSON.stringify(formData),
          contentType: 'application/json',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
          },
          success: function (data) {
            console.log('Event added:', data);

            addEventToCalendar({
              title: formData.place_name,
              description: formData.notes,
              start: formData.event_date,
              className: formData.event_color,
              icon: formData.event_icon,
            });

            jQuery('#modal-view-event-add').modal('hide');
          },
          error: function (error) {
            console.error('Error adding event:', error);
          }
        });
      });
    });
  }

  // "NOTES" section
  const notesData = [
    {
      place: 'Place Name: Example Place 1',
      date: 'Event Date: October 30, 2023',
      notes: 'Notes: This is a sample card with place name, event date, and notes for card 1.'
    }
  ];

  function generateCards() {
    const notesRow = document.getElementById('notes-row');
    notesData.forEach((data) => {
      const colDiv = document.createElement('div');
      colDiv.className = 'col-3';
      colDiv.innerHTML = `
        <div class="notes-card">
          <div class="place">${data.place}</div>
          <div class="date">${data.date}</div>
          <div class="notes">${data.notes}</div>
          <div class="button-container">
            <button class="edit-button" data-bs-toggle="modal" data-bs-target="#editModal"><i class="fas fa-edit"></i></button>
            <button class="delete-button"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      `;
      notesRow.appendChild(colDiv);
    });
  }

  generateCards();
});
