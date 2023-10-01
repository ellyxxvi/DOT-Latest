<!DOCTYPE html>
<html>

<head>
    <title>Search</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>


    <link href="css/search_page.css" rel="stylesheet">
    <link rel="icon" href="image/LOGO (2).png" type="image/png">
</head>

<body>
    <?php include 'header.php'; ?>

    <div class="container">

        <div class="row height d-flex justify-content-center align-items-center">

            <div class="col-md-10">

                <div class="search">
                    <i class="fa fa-search"></i>
                    <input type="text" class="form-control" placeholder="What are you looking for?">
                    <button class="btn btn-primary">Search</button>
                </div>

            </div>
        </div>
    <div class="text-title">
        <h2>Related Results...</h2>
    </div>
        <div class="image-gallery">
                    <!-- Image gallery items will be dynamically added here -->
        </div>
        <div class="text-center mt-4">
                    <button class="btn btn-custom load-more">Load More</button>
                    <button class="btn btn-custom load-less" style="display: none;">Load Less</button>
        </div>
    </div>
    <?php include 'footer.php'; ?>
    <script src="js/search_page.js"></script>
</body>

</html>