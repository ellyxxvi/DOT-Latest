<!DOCTYPE html>
<html lang="en">

<?php include 'header.php'; ?>

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Where to Go</title>
  <!-- Font Awesome CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
  <!-- Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
  <!-- Stylesheet -->
  <link href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="css/wheretogo_cardcontent.css" />
  <script src="https://kit.fontawesome.com/e173e574d6.js" crossorigin="anonymous"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/magnific-popup.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/jquery.magnific-popup.min.js"></script>
</head>

<link rel="icon" href="image/LOGO (2).png" type="image/png">
</head>

<body>
  <section class="iframe-container">
    <div class="background-image"></div>
    <h3></h3>
    </div>
    </div>
  </section>

  <section class="paragraph">
    <p class="dynamic-paragraph"></p>
  </section>

  <div class="iframe">
    <iframe src="wheretogo_carousel.html" width="100%" height="585" frameborder="0" background="transparent"></iframe>
  </div>
  <div class="iframe">
    <iframe iframe id="recommendedIframe" src="famousthings-carousel.html" width="100%" height="585" frameborder="0" background="transparent"></iframe>
  </div>

  <!-- <div class="iframe">
    <iframe src="wheretogo_maps.html" width="100%" height="585" frameborder="0" background="transparent"></iframe>
  </div> -->

  <script src="js/wheretogo_cardcontent.js"></script>
</body>
<?php include 'footer.php'; ?>

</html>