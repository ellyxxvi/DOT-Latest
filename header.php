<!DOCTYPE html>

<html>

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://kit.fontawesome.com/83c0f4a797.js" crossorigin="anonymous"></script>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <link href="css/header.css" rel="stylesheet">
    <link rel="icon" href="image/LOGO (2).png" type="image/png">

</head>

<body>
    <header>
        <div class="nav">
            <input type="checkbox" id="nav-check">
            <div class="nav-header">
                <div class="nav-logo">
                    <a href="home_main.php">
                        <img src="image/LOGO (5).png" alt="Go Explore Logo" class="logo-image">
                    </a>
                </div>
            </div>
            <div class="nav-btn">
                <label for="nav-check">
                    <span></span>
                    <span></span>
                    <span></span>
                </label>
            </div>

            <div class="nav-links" id="nav-container">
                <a class="nav-link-1" href="explore_main.php">Let's Explore</a>
                <a class="nav-link-2" href="wheretogo_main.php">Where to Go</a>
                <a class="nav-link-3" href="calendar.php">Calendar of Activities</a>
                <a class="nav-link-4" href="love_our_planet.php">Love Our Planet</a>
                <a class="nav-search-icon" href="search_page.php">
                    <i class="fa-solid fa-magnifying-glass" style="color: #ffffff;"></i>
                </a>
            </div>

            <script>
                const API_PROTOCOL = 'https'
                const API_HOSTNAME = 'goexplorebatangas.com/api'
                // const API_PROTOCOL = 'http'
                // const API_HOSTNAME = '13.229.101.17/api'
                // Function to check if the user is authenticated
                function checkAuthentication() {
                    var isAuthenticated = localStorage.getItem("access_token");

                    if (isAuthenticated != null) {
                        return true;
                    } else {
                        return false;
                    }
                }

                // Function to redirect the user to the login page
                function redirectToLogin() {
                    window.location.href = 'login_register.php';
                }

                // Function to check access to the "favorites" page
                function checkFavoritesAccess() {
                    var isAuthenticated = checkAuthentication();

                    if (isAuthenticated) {
                        return true;
                    } else {
                        redirectToLogin();
                        return false;
                    }
                }

                // Get the current page's URL
                var currentPageURL = window.location.href;

                // Find the navigation link that matches the current page's URL
                const navLinks = document.querySelectorAll('.nav-links a');
                navLinks.forEach((link) => {
                    if (link.href === currentPageURL) {
                        link.classList.add('active');
                    }
                });

                document.addEventListener('DOMContentLoaded', () => {
                    var isAuthenticated = checkAuthentication();
                    var navUserIcon = document.createElement("a");
                    var icon = document.createElement("i");
                    icon.className = "fa-solid fa-user";
                    icon.style.color = "#ffffff";
                    navUserIcon.appendChild(icon);

                    if (isAuthenticated) {
                        navUserIcon.className = "nav-user-icon";
                        navUserIcon.href = "itinerary_favorites.php";
                    } else {
                        navUserIcon.className = "nav-user-icon";
                        navUserIcon.href = "login_register.php";
                    }

                    var navContainer = document.getElementById("nav-container");
                    navContainer.appendChild(navUserIcon);
                });
            </script>
        </div>
        </div>
    </header>
</body>

</html>