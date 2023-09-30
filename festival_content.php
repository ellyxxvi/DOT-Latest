<!DOCTYPE html>
<html>
<?php include 'header.php'; ?>

<head>
    <title>Festival</title>
    <script src="https://kit.fontawesome.com/83c0f4a797.js" crossorigin="anonymous"></script>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css" rel="stylesheet">
    <link href="css/festival_content.css" rel="stylesheet">
    <link rel="icon" href="image/LOGO (2).png" type="image/png">
</head>

<body>
    <div class="bg-image" style="height: 450px; background-repeat: no-repeat; background-size: cover;">
        <div class="overlay">
            <h1 class="overlay-title"></h1>
        </div>
    </div>

    <div class="festival-title"></div>
    <div class="festival-details">
        <div class="festival-description"></div>
    </div>
    <div class="wheretostay-container">
        <div class="where-to-stay">WHERE TO STAY</div>

        <section class="pt-5 pb-5">
            <div class="container">
                <div class="row">
                    <div class="col-6">
                        <!-- <h3 class="mb-3">Carousel cards title</h3> -->
                    </div>
                    <div class="col-6 text-right">
                        <a class="btn btn-primary mb-3 mr-1" href="#carouselExampleIndicators2" role="button" data-slide="prev">
                            <i class="fa fa-arrow-left"></i>
                        </a>
                        <a class="btn btn-primary mb-3 " href="#carouselExampleIndicators2" role="button" data-slide="next">
                            <i class="fa fa-arrow-right"></i>
                        </a>
                    </div>
                    <div class="col-12">
                        <div id="carouselExampleIndicators2" class="carousel slide" data-ride="carousel">
                            <div class="carousel-inner">
                                <!-- The dynamically generated content will be inserted here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
    <?php include 'footer.php'; ?>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js"></script>
    <script src="js/festival_content.js"></script>
</body>

</html>