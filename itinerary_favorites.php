<!DOCTYPE html>
<html lang="en">
<?php include 'header.php'; ?>

<head>
  <link rel="icon" type="image/png" href="images/logo_tab.png" sizes="64x64">
  <title>Favorites</title>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Bootstrap CSS CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.0/css/bootstrap.min.css">

  <link rel="stylesheet" href="css/itinerary_favorites.css" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">

  <link rel="icon" href="image/LOGO (2).png" type="image/png">
</head>

<body>
  <section id="home">
    <div id="carouselExampleControls" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        <!-- Images will be dynamically added here -->
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
    <div class="slider-content">
      <div class="container">
        <div class="row">
          <h2>BATANGAS PHILIPPINES</h2>
        </div>
        <div class="row">
          <p>Where Heritage Meets Nature, a Paradise to Treasure!</p>
        </div>
      </div>
    </div>
  </section>


  <nav class="navbar navbar-expand-lg">
    <ul class="navbar-nav">
      <li class="nav-item">
        <button class="nav-link btn btn-link animate" id="favoritesButton">
          <i class="fas fa-heart"></i> Favorites
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link btn btn-link animate" id="visitedButton">
          <i class="fas fa-check"></i> Visited
        </button>
      </li>
      <li class="nav-item">
            <button class="nav-link btn btn-link animate" id="builderButton">
              <i class="fas fa-calendar"></i> Itinerary Builder
            </button>
      </li>
      <li class="nav-item">
        <button class="nav-link btn btn-link animate" id="accountButton">
          <i class="fas fa-cog"></i> Account
        </button>
      </li>
    </ul>
  </nav>


  <div class="container">
    <div class="box-container">
      <!-- Box containers with cards will be added here dynamically -->
    </div>
  </div>

  <div class="modal fade" id="ratingModal" tabindex="-1" aria-labelledby="ratingModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="ratingModalLabel">Rate and Comment</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="rating">Rating:</label>
            <div class="ratings">
              <span class="star" data-rating="1"><i class="fas fa-star star-icon"></i></span>
              <span class="star" data-rating="2"><i class="fas fa-star star-icon"></i></span>
              <span class="star" data-rating="3"><i class="fas fa-star star-icon"></i></span>
              <span class="star" data-rating="4"><i class="fas fa-star star-icon"></i></span>
              <span class="star" data-rating="5"><i class="fas fa-star star-icon"></i></span>
            </div>

            <input type="hidden" id="rating" value="0">
          </div>
          <div class="form-group">
            <label for="comment">Comment:</label>
            <textarea class="form-control" id="comment" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Exit</button>
          <button type="button" class="btn btn-primary" id="saveRating">Save</button>
        </div>
      </div>
    </div>
  </div>




  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.0/js/bootstrap.bundle.min.js"></script>
  <script src="js/itinerary_favorites.js"></script>
  <?php include 'footer.php'; ?>
</body>
  

</html>