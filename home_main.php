<!DOCTYPE html>
<html lang="en">
<?php include 'header.php'; ?>

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Responsive Services Section</title>
  <!-- Font Awesome CDN-->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
  <!-- Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
  <!-- Stylesheet -->
  <link href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="css/home_main.css" />
</head>

<body>
  <div class="iframe-container">
    <iframe src="home_slider.html" width="100%" height="775" frameborder="0" background="transparent"></iframe>
  </div>

  <section>
    <section>
      <div class="row">
        <div class="row">
          <div class="card">
            <a href="explore_main.php?category=swim">
            <div class="icon-wrapper">
              <i class="fa-solid fa-water"></i>
            </div>
            <h3>Swim and Beaches</h3>
          </a>
          </div>
        </div>
        <div class="row">
          <div class="card2">
            <a href="explore_main.php?category=nature">
            <div class="icon-wrapper2">
              <i class="fa-solid fa-leaf"></i>
            </div>
            <h3>Nature Trip</h3>
          </a>
          </div>
        </div>
        <div class="row">
          <div class="card3">
            <a href="explore_main.php?category=tourist">
            <div class="icon-wrapper3">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <h3>Tourist Spots</h3>
          </a>
          </div>
        </div>
        <div class="row">
          <div class="card4">
            <a href="explore_main.php?category=hotels">
            <div class="icon-wrapper4">
              <i class="fa-solid fa-hotel"></i>
            </div>
            <h3>Hotel</h3>
          </a>
          </div>
        </div>
        <div class="row">
          <div class="card5">
            <a href="explore_main.php?category=churches">
            <div class="icon-wrapper5">
              <i class="fa-solid fa-church"></i>
            </div>
            <h3>Churches</h3>
          </a>
          </div>
        </div>
        <div class="row">
          <div class="card6">
            <a href="calendar.php?category=events">
            <div class="icon-wrapper6">
              <i class="fa-solid fa-calendar-days"></i>
            </div>
            <h3>Events and Culture</h3>
          </a>
          </div>
        </div>
      </div>
    </section>

  <section class="video">
    <div class="hero">
      <div class="content">
        <h1> GO EXPLORE </h1>
        <br>
        <p class="dynamic-paragraph">Welcome to Batangas, where beautiful smiles are seen everywhere.
          With the beautiful places <br> and cultures, you'll be blown away! <br>
          Tara sinsay na!
          <br><br>
        </p>

        <div class="video-container">
          <video loop class="video-element" id="video" controls>
            <source src="image/places/video.mp4" type="video/mp4">
          </video>
        </div>
      </div>
    </div>
  </section>

  <div class="iframe">
    <iframe src="home_most_rated.html" width="100%" height="585" frameborder="0" background="transparent"></iframe>
  </div>
  <div class="iframe">
    <iframe src="home_most_viewed.html" width="100%" height="585" frameborder="0" background="transparent"></iframe>
  </div>
  
  <script src="js/home_main.js"></script>
  <?php include 'footer.php'; ?>
</body>

</html>