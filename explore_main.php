<!DOCTYPE html>
<html>

<?php include 'header.php'; ?>

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Let's Explore</title>
  <!-- Font Awesome CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
  <!-- Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
  <!-- Stylesheet -->
  <link rel="stylesheet" href="css/explore_main.css" />
  <script src="https://kit.fontawesome.com/e173e574d6.js" crossorigin="anonymous"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

  <link href="css/footer.css" rel="stylesheet">
  <link rel="icon" href="image/LOGO (2).png" type="image/png">
</head>

<body>

  <div>
    <div class="iframe-container">
      <div class="content" style="background: url('image/banig.jpg')">
        <h1><i class="fa-solid fa-location"></i></h1>
      </div>
    </div>
  </div>
  <div class="search-bar">
    <input type="text" id="search-input" placeholder="Search...">
    <button id="search-button">Search</button>
  </div>

  <section class="services">

    <div class="side-nav">
      <ul class="nav-links">
        <div class="header">
          <h1>EXPLORE INTERESTS</h1>
        </div>
        <li><a href="#" class="category-link swim-beaches" data-category="swim and beaches"><i class="fa-solid fa-water"></i>
            <p>Swim and Beaches</p>
          </a></li>
        <li><a href="#" class="category-link nature-trip" data-category="nature trip"><i class="fa-solid fa-leaf"></i>
            <p>Nature Trip</p>
          </a></li>
        <li><a href="#" class="category-link tourist-spots" data-category="tourist spots"><i class="fas fa-map-marker-alt"></i>
            <p>Tourist Spots</p>
          </a></li>
        <li><a href="#" class="category-link hotel" data-category="hotel"><i class="fa-solid fa-hotel"></i>
            <p>Hotel</p>
          </a></li>
        <li><a href="#" class="category-link churches" data-category="churches"><i class="fa-solid fa-church"></i>
            <p>Churches</p>
          </a></li>
        <!-- <li><a href="#" class="category-link events-culture" data-category="events"><i class="fa-solid fa-calendar-days"></i><p>Events and Culture</p></a></li> -->
        <li><a href="#" class="category-link see-all"><i class="fa-solid fa-eye"></i>
            <p>See All</p>
          </a></li>
      </ul>

    </div>
    <div class="services-content" id="services-content">
      <div class="row">
        <!-- The dynamic service cards will be inserted here -->

      </div>

      <div class="load-more-container">
        <button id="load-more-btn" class="load-btn">Load More</button>
      </div>
    </div>

  </section>
  <script src="js/explore_main.js"></script>
</body>

</html>