<!DOCTYPE html>
<html>
<?php include 'header.php'; ?>

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendar of Activities</title>
    <script src="https://kit.fontawesome.com/83c0f4a797.js" crossorigin="anonymous"></script>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">
    <link href="css/calendar.css" rel="stylesheet">
    <link rel="icon" href="image/LOGO (2).png" type="image/png">
</head>

<body>


    <div class="bg-image" style="background-image: url('image/banig.jpg'); height: 100%; height: 450px; background-repeat: no-repeat; background-size: cover;">
        <div class="overlay">
            <h1 class="overlay-text">FESTIVALS</h1>
        </div>
    </div>

    <section id="calendar-gallery" class="container1">
        <div class="row">
            <!-- Column 1: Dropdown -->
            <div class="col-md-3 ">
                <div class="datepicker">
                    <select id="monthDropdown" class="form-select">
                        <option value="" disabled selected>Select by Month</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                </div>
            </div>
            <!-- Column 2: Gallery and Load More Button -->
            <div class="col-md-9 mb-3">
                <div class="image-gallery">
                    <!-- Image gallery items will be dynamically added here -->
                </div>
                <div class="text-center mt-4">
                    <button class="btn btn-custom load-more">Load More</button>
                    <button class="btn btn-custom load-less" style="display: none;">Load Less</button>
                </div>
            </div>
        </div>
    </section>

    <section id="incoming-festival" class="pt-5 pb-5">
        <div class="container">
            <div class="row">
                <div class="col-6">
                    <h3 class="mb-3" style="color: black;">INCOMING FESTIVAL</h3>
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
                            <!-- Slides will be dynamically generated here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <?php include 'footer.php'; ?>
    <script src=" https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js	"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js"></script>
    <script src="js/calendar.js"></script>

</body>

</html>