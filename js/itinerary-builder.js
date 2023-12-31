
document.addEventListener("DOMContentLoaded", function () {
  const favoritesButton = document.getElementById("favoritesButton");
  const visitedButton = document.getElementById("visitedButton");
  const accountButton = document.getElementById("accountButton");
  const builderButton = document.getElementById("builderButton");
  const accessToken = localStorage.getItem('access_token');

  var myModalAdd = new bootstrap.Modal(document.getElementById('modal-view-event-add'));


  if (!accessToken) {
    // Redirect to the login page
    window.location.href = 'login_register.php';
    return; // Stop executing further code
  }

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
    'image/banig.jpg',
    'image/bg1.jpg',
    'image/barako.jpg',
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

  const isLoggedIn = localStorage.getItem('access_token') !== null;
  const placeNameDropdown = document.getElementById("place_name");
  const editplaceNameDropdown = document.getElementById("edit_place_name");
  if (isLoggedIn) {
    const accessToken = localStorage.getItem('access_token');
    const userId = parseJwt(accessToken);

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

          if (placeNameDropdown) {
            placeNameDropdown.innerHTML = '';

            data.forEach((place) => {
              const option = document.createElement('option');
              option.value = place.id;
              option.textContent = place.title;
              placeNameDropdown.appendChild(option);

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

      jQuery('.datetimepicker').datepicker({
        language: 'en',
        timepicker: true,
        range: true,
        multipleDates: true,
        multipleDatesSeparator: " - ",
      });

      console.log('Datepicker initialized.');

      const calendar = jQuery('#calendar').fullCalendar({
        themeSystem: 'bootstrap4',
        businessHours: false,
        defaultView: 'month',
        editable: true,
        header: {
          left: 'title',
          right: 'today prev,next'
        },
        // events: eventData,
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

      let eventStore = []; // Store event data

      jQuery('#edit_event_color').change(function () {
        var selectedColor = jQuery(this).val();

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
              addEventToCalendar(eventData); // Add events to the calendar
              eventStore.push(eventData); // Store event data
            });
          })
          .catch((error) => {
            console.error('Error fetching events:', error);
          });
      }
      // Function to add events to the calendar
      function addEventToCalendar(eventData) {
        calendar.fullCalendar('renderEvent', {
          title: eventData.place_name,
          description: eventData.notes,
          start: eventData.event_date,
          className: eventData.event_color,
          icon: eventData.event_icon,
        });
      }
      // Switch view callback
      calendar.fullCalendar('option', 'viewRender', function (view) {
        // When the view changes, re-add events from the eventStore
        eventStore.forEach((eventData) => {
          addEventToCalendar(eventData);
        });
      });

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

            addEventToCalendar({
              title: formData.place_name,
              description: formData.notes,
              event_date: formData.event_date,
              className: formData.event_color,
              icon: formData.event_icon,
            });

            window.location.reload();

            jQuery('#modal-view-event-add').modal('hide');
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error adding event:');
            console.log('Response Text:', JSON.stringify(jqXHR));
            console.log('Status:', textStatus);
            console.log('Error Thrown:', errorThrown);
          },
          viewRender: function (view, element) {
            // Get the current view's start date (e.g., the start of the month)
            const startDate = view.start.format('YYYY-MM-DD');

            // Reload the page with the start date as a query parameter
            window.location.href = window.location.pathname + '?start_date=' + startDate;
          }
        });
      });


    });


    // FOR NOTES 
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
        const colorClass = data.event_color;
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
          // Show the confirmation modal when the delete button is clicked
          showConfirmationModal(data.id);
        });
      });
    }

    // Function to show the confirmation modal
function showConfirmationModal(noteId) {
  const confirmationModal = document.getElementById('confirmationModal');
  const confirmDeleteButton = document.getElementById('confirmDeleteButton');
  const cancelDeleteButton = document.getElementById('cancelDeleteButton');

  // Set the noteId as a data attribute of the modal
  confirmationModal.setAttribute('data-note-id', noteId);

  // Show the modal
  confirmationModal.style.display = 'block';

  // Add event listener for the confirm delete button
  confirmDeleteButton.addEventListener('click', () => {
    const noteIdToDelete = confirmationModal.getAttribute('data-note-id');
    handleDeleteNote(noteIdToDelete);
    // Close the modal after confirming delete
    confirmationModal.style.display = 'none';
  });

  // Add event listener for the cancel button to close the modal
  cancelDeleteButton.addEventListener('click', () => {
    confirmationModal.style.display = 'none';
  });
}


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
            fetchNotesFromServer();
            $('#editModal').modal('hide');
            window.location.reload();
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

        if (response.ok) {
          console.log('Note deleted successfully');
          // Refresh the window after deleting the note
          window.location.reload();
        } else {
          console.error('Failed to delete note. Server returned status:', response.status);
        }
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
