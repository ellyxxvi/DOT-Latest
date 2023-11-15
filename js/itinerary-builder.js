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


  const eventData = [];

  function addEventToCalendar(eventData) {
    jQuery('#calendar').fullCalendar('renderEvent', eventData);
  }

  // Check if the user is logged in
  const isLoggedIn = localStorage.getItem('access_token') !== null;
  const placeNameDropdown = document.getElementById("place_name");
  const editplaceNameDropdown = document.getElementById("edit_place_name");
  if (isLoggedIn) {
    const accessToken = localStorage.getItem('access_token');
    const userId = parseJwt(accessToken);
    // fetching place name from favorites
    function fetchFavoritePlaces() {
      const favoritesApiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/itineraries/items/`;
    
      fetch(favoritesApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          console.log('API Response for fetchFavoritePlaces:', data);
    
          // Check if the dropdown element exists and is correctly referenced
          if (placeNameDropdown) {
            placeNameDropdown.innerHTML = '';
    
            data.forEach((place) => {
              const option = document.createElement('option');
              option.value = place.id;
              option.textContent = place.title;
              placeNameDropdown.appendChild(option);
              // Assuming editplaceNameDropdown is another dropdown, you might want to add options there as well
              const editOption = document.createElement('option');
              editOption.value = place.id;
              editOption.textContent = place.title;
              editplaceNameDropdown.appendChild(editOption);
            });
          } else {
            console.error('placeNameDropdown element not found or correctly referenced.');
          }
        })
        .catch((error) => {
          console.error('Error fetching favorite places:', error);
        });
    }
    
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

      // Initialize the calendar
      const calendar = jQuery('#calendar').fullCalendar({
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
    
    // Listen for changes in the select element
    jQuery('#edit_event_color').change(function () {
        // Get the selected option value
        var selectedColor = jQuery(this).val();
    
        // Update the background color of the event element
        jQuery('.fc-bg-pinkred').css('background', selectedColor);
    });
    
      fetchEventsFromServer();


      fetchFavoritePlaces();

      function fetchEventsFromServer() {
        const apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/itinerary-builder`;

        fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then((data) => {
            console.log('API Response for fetching events:', data);
            data.forEach((eventData) => {
              addEventToCalendar({
                title: eventData.place_name,
                description: eventData.notes,
                start: eventData.event_date,
                className: eventData.event_color,
                icon: eventData.event_icon,
              });
            });

          })
          .catch((error) => {
            console.error('Error fetching events:', error);
          });
      }

      function updateCalendarEvents(eventsData) {
        //calendar.fullCalendar('removeEvents');
        // console.log('Events Data Test:',JSON.stringify(eventsData));
        // // calendar.addEventSource(eventsData);

        // calendar.fullCalendar('addEventSource', eventsData);
        // // Add the events to the calendar
        // //calendar.fullCalendar.addEventSource(eventsData);
        // jQuery('#calendar').fullCalendar('renderEvent', eventData);
        // Render the calendar
        //calendar.render();
        //jQuery('#calendar').fullCalendar('renderEvent', eventsData);
      }

      jQuery("#add-event").submit(function (event) {
        event.preventDefault();

        var formData = {
          place_name: placeNameDropdown.options[placeNameDropdown.selectedIndex].text,
          event_date: new Date(jQuery('#event_date').val()).toISOString(),
          notes: jQuery('#notes').val(),
          event_color: jQuery('#event_color').val(),
          event_icon: jQuery('#event_icon').val(),
        };

        var apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/itinerary-builder`;

        console.log('API Request for adding event:', formData);

        jQuery.ajax({
          url: apiUrl,
          type: 'POST',
          data: JSON.stringify(formData),
          contentType: 'application/json',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
          },
          success: function (data) {
            console.log('API Response for adding event:', data);

            // Add the event to the calendar
            addEventToCalendar({
              title: formData.place_name,
              description: formData.notes,
              event_date: formData.event_date,
              className: formData.event_color,
              icon: formData.event_icon,
            });

            // After adding the event, fetch the updated events from the server
            window.location.reload();

            jQuery('#modal-view-event-add').modal('hide');
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error adding event:');
            console.log('Response Text:', JSON.stringify(jqXHR));
            console.log('Status:', textStatus);
            console.log('Error Thrown:', errorThrown);
          }
        });
      });

    });


    // FOR NOTES 
    // Fetching notes from the server
async function fetchNotesFromServer() {
  const notesApiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/itinerary-builder`;

  try {
      const response = await fetch(notesApiUrl, {
          method: 'GET',
          headers: {
              'Authorization': 'Bearer ' + accessToken,
          },
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('API Response for fetching notes:', data);
      generateCards(data);
  } catch (error) {
      console.error('Error fetching notes:', error);
  }
}

function generateCards(notesData) {
  const notesRow = document.getElementById('notes-row');
  notesRow.innerHTML = '';

  notesData.forEach(data => {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-12 col-sm-3 col-md-3';
    const colorClass = data.event_color; // Corrected to use event_color from the data
    colDiv.innerHTML = `
        <div class="notes-card ${colorClass}">
            <div class="place">Where: ${data.place_name}</div>
            <div class="date">When: ${data.event_date}</div>
            <div class="notes">Notes: ${data.notes}</div>
            <div class="button-container">
                <button class="edit-button" data-note-id="${data.id}" data-bs-toggle="modal" data-bs-target="#editModal">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-button" data-note-id="${data.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;

    notesRow.appendChild(colDiv);

    // Add event listeners
    const noteCard = colDiv.querySelector(".notes-card");
    noteCard.addEventListener('click', () => {
        noteCard.classList.toggle('notes-card-expanded');
    });

    colDiv.querySelector(".edit-button").addEventListener('click', (e) => {
        e.stopPropagation(); 
        handleEditNote(data);
    });
    colDiv.querySelector(".delete-button").addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteNote(data.id);
    });
  });
}


// Color change event listener
jQuery(document).ready(function () {
  jQuery('#event_color').change(function () {
      var selectedColor = jQuery(this).val();
      jQuery('#notes').removeClass('fc-bg-default fc-bg-darkpink fc-bg-darkorange fc-bg-purple')
                       .addClass(selectedColor);
  });
});



    async function handleEditNote(noteData) {
      const placeNameDropdown = document.getElementById('edit_place_name');
      const eventDateInput = document.getElementById('edit_event_date');
      const notesInput = document.getElementById('edit_notes');
      const eventColorSelect = document.getElementById('edit_event_color');
      const eventIconSelect = document.getElementById('edit_event_icon');
    
      // Fetch favorite places and populate the dropdown
      // await fetchFavoritePlaces();
    
      // Set the date in ISO format for consistency
      eventDateInput.value = new Date(noteData.event_date).toISOString().split('T')[0];
    
      // Update other form fields with noteData
      notesInput.value = noteData.notes;
      eventColorSelect.value = noteData.event_color;
      eventIconSelect.value = noteData.event_icon;
    
      // Update dropdown to select the option with the place_name value
      for (let i = 0; i < placeNameDropdown.options.length; i++) {
        if (placeNameDropdown.options[i].text === noteData.place_name) {
          placeNameDropdown.selectedIndex = i;
          break;
        }
      }
    
      // Remove any previous submit event listeners to avoid duplicates
      const editForm = $('#editModal');
      editForm.off('submit').on('submit', function (e) {
        e.preventDefault();
        console.log("Submit event triggered");
    
        const formData = {
          place_name: $('#edit_place_name option:selected').text(),
          event_date: new Date($('#edit_event_date').val()).toISOString(),
          notes: $('#edit_notes').val(),
          event_color: $('#edit_event_color').val(),
          event_icon: $('#edit_event_icon').val(),
        };
    
        const apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/itinerary-builder/${noteData.id}`;
        console.log("formData for edit: ", JSON.stringify(formData));
    
        $.ajax({
          url: apiUrl,
          type: 'PUT',
          data: JSON.stringify(formData),
          contentType: 'application/json',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
          },
          success: function (data) {
            console.log('Note edited:', data);
            fetchNotesFromServer(); // Optionally refresh the notes displayed
            // Optionally close the modal if one is used
            $('#editModal').modal('hide');
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error editing note:', errorThrown);
            console.log('Response Text:', jqXHR.responseText);
            console.log('Status:', textStatus);
          }
        });
      });
    }
    


    async function handleDeleteNote(noteId) {
      const apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/itinerary-builder/${noteId}`;

      try {
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        });

        const data = await response.json();
        console.log('Note deleted:', data);
        fetchNotesFromServer();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }

    fetchNotesFromServer();

  }


  function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

});
