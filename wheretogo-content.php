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
    <link rel="stylesheet" href="css/wheretogo-content.css" />
    <script src="https://kit.fontawesome.com/e173e574d6.js" crossorigin="anonymous"></script>

    <link href="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/magnific-popup.min.css" rel="stylesheet">

    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css" rel="stylesheet">


    <link rel="icon" href="image/LOGO (2).png" type="image/png">

</head>

<body>
    <section class="iframe-container">
        <div class="background-image" style="background-position: center;"></div>
        <div id="imageModal" class="modal">
            <span class="close" onclick="closeImageModal()">&times;</span>
            <img id="modalImage" class="modal-content">
        </div>
        <h3></h3>
        <div class="ratings" id="total-rating">
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star-half-alt"></i>
        </div>
        <div id="number-of-visits">
            <!-- Number of visits will be displayed here -->
        </div>
        <button id="add-to-favorites" class="add-to-favorites">
            <i class="fas fa-heart"></i> Add to Favorites
        </button>
    </section>



    <section class="image-gallery">
        <div class="container">
            <div class="row gallery" id="dynamic-gallery">
                <!-- Images will be generated here -->
            </div>
        </div>
    </section>


    <div class="modal" id="contactModal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Contact Information</h2>
            <p id="contactInfo"></p>
            <button id="copyContactButton">
                <i class="fas fa-copy"></i> Copy
            </button>
        </div>
    </div>
    <div class="modal" id="LinksModal">
        <div class="modal-content">
            <span class="close-modal1">&times;</span>
            <h2>Social Links</h2>
            <p id="linksInfo"></p>
        </div>
    </div>
    <div class="modal" id="addressModal">
        <div class="modal-content">
            <span class="close-modal2">&times;</span>
            <h2>Address Information</h2>
            <p id="addressInfo"></p>
            <button id="copyAddressButton">
                <i class="fas fa-copy"></i> Copy
            </button>
        </div>
    </div>


    <section>
        <br><br>
        <p class="dynamic-paragraph" id="paragraph"></p>
    </section>

    <div class="filter-nav">
        <button class="active" data-rating="all">All</button>
        <button data-rating="5">5 Stars</button>
        <button data-rating="4">4 Stars</button>
        <button data-rating="3">3 Stars</button>
        <button data-rating="2">2 Stars</button>
        <button data-rating="1">1 Star</button>
    </div>

    <div class="row">
        <!-- Comments Section Column -->
        <div class="col-md-6">
            <section class="comments-section">
                <div class="comment-cards-container" id="commentCardsContainer">
                    <!-- Your comment cards go here -->
                </div>
            </section>
        </div>

        <div class="col-md-6 place-details">
            <div class="contact-card">
                <h2 class="explore-title">LET'S EXPLORE</h2>
                <div class="wrapper">
                    <i id="left" class="fa-solid fa-angle-left"></i>
                    <ul class="carousel">
                        <!-- Cards will be generated dynamically here -->
                    </ul>
                    <i id="right" class="fa-solid fa-angle-right"></i>
                </div>

                <div class="row">
                    <div id="nearbyPlacesContainer" class="col-md-12 list-nearby-places">
                        <div class="list-card overflow-auto">
                            <h5 class="h5-nearby-places">
                                <i class="fas fa-phone-alt"></i> Emergency Hotlines
                            </h5>

                            <p>Here are the emergency hotlines you can use in case of an emergency:</p>
                            <ul id="ul-nearby-places" class="ul-nearby-places">
                                <!-- List items will be appended here dynamically -->
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>


    <?php include 'footer.php'; ?>
    <script src="js/wheretogo-content.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.5/popper.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/jquery.magnific-popup.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

</body>

</html>