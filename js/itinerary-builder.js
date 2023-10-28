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
  });

  jQuery(document).ready(function(){
    jQuery('.datetimepicker').datepicker({
        timepicker: true,
        language: 'en',
        range: true,
        multipleDates: true,
        multipleDatesSeparator: " - "
    });
    jQuery("#add-event").submit(function(){
        alert("Submitted");
        var values = {};
        $.each($('#add-event').serializeArray(), function(i, field) {
            values[field.name] = field.value;
        });
        console.log(values);
    });
  });

  (function () {
    'use strict';
    jQuery(function() {
      jQuery('#calendar').fullCalendar({
        themeSystem: 'bootstrap4',
        businessHours: false,
        defaultView: 'month',
        editable: true,
        header: {
          left: 'title',
          center: 'month,agendaWeek,agendaDay',
          right: 'today prev,next'
        },
        events: [
          {
            title: 'Barber',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eu pellentesque nibh. In nisl nulla, convallis ac nulla eget, pellentesque pellentesque magna.',
            start: '2023-05-05',
            end: '2023-05-05',
            className: 'fc-bg-default',
            icon: "circle"
          },
          {
            title: 'Flight Paris',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eu pellentesque nibh. In nisl nulla, convallis ac nulla eget, pellentesque pellentesque magna.',
            start: '2023-08-08T14:00:00',
            end: '2023-08-08T20:00:00',
            className: 'fc-bg-deepskyblue',
            icon: "cog",
            allDay: false
          }
        ],
        eventRender: function(event, element) {
          if(event.icon){
            element.find(".fc-title").prepend("<i class='fa fa-"+event.icon+"'></i>");
          }
        },
        dayClick: function(date, jsEvent, view) {
          jQuery('#modal-view-event-add').modal('show');
        },
        eventClick: function(event, jsEvent, view) {
          jQuery('.event-icon').html("<i class='fa fa-"+event.icon+"'></i>");
          jQuery('.event-title').html(event.title);
          jQuery('.event-body').html(event.description);
          jQuery('.eventUrl').attr('href',event.url);
          jQuery('#modal-view-event').modal('show');
        },
      })
    });
  })(jQuery);