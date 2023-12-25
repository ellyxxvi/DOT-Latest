<!DOCTYPE html>
<html lang="en">
<?php include 'header.php'; ?>

<head>
    <link rel="icon" type="image/png" href="images/logo_tab.png" sizes="64x64">
    <title>User Account</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">

    <!-- Bootstrap CSS CDN -->
    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script> -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">

    <link rel="stylesheet" href="css/user-profile.css" />
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
                    <p>Where heritage meets nature, a paradise to treasure!</p>
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

    <!-- USER PROFILE -->
    <div class="container emp-profile">
        <form method="post">
            <div class="row">
                <div class="col-md-4">
                    <div class="profile-img">
                        <img src="" alt="Profile Image" id="profile-img" />
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="profile-head with-border-bottom">
                        <h5 class="nameHolder"></h5>
                        <h6>User</h6>

                    </div>
                </div>
                <div class="col-md-2">
                    <input type="button" class="edit-profile-button" id="profile-edit-btn" name="btnEditProfile" value="Edit Profile" data-bs-toggle="modal" data-bs-target="#editModal" />
                    <input type="button" class="profile-logout-btn" id="profile-logout-btn" name="btnLogout" value="Logout" data-bs-toggle="modal" data-bs-target="#logoutModal" />
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="profile-work">
                        <p>Preference <a href="#" class="edit-button" onclick="editPreferences()"><i class="fas fa-edit"></i></a></p>
                        <!-- Dynamic preference items will be generated here -->
                    </div>
                </div>

                <div class="col-md-8 user-information">
                    <div class="tab-content profile-tab" id="myTabContent">
                        <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                            <table style="width:100%">
                                <!-- Dynamic table data rows will be generated here -->
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
     <!-- Preference Modal -->
     <div class="modal fade" id="preferenceModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editModalLabel">Edit User Preference</h5>
                
                </div>
                <div class="modal-body">
                    <div class="container">
                        <h6>Please choose what you are interested in the most:</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="preference-button btn btn-swim" id="preferenceSwim" value="swim and beaches">
                                    <i class="fas fa-swimmer"></i> Swim and Beaches
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="preference-button btn btn-nature" id="preferenceNature" value="nature trip">
                                    <i class="fas fa-tree"></i> Nature Trip
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="preference-button btn btn-churches" id="preferenceChurches" value="churches">
                                    <i class="fas fa-church"></i> Churches
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="preference-button btn btn-events" id="preferenceEvents" value="events and culture">
                                    <i class="fas fa-calendar-alt"></i> Events and Culture
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="preference-button btn btn-hotel" id="preferenceHotel" value="hotel">
                                    <i class="fas fa-hotel"></i> Hotel
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="preference-button btn btn-tourist-spots" id="preferenceTouristSpots" value="tourist spots">
                                    <i class="fas fa-camera"></i> Tourist Spots
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="cancelButton" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="savePreferences">Save Preferences</button>
                </div>
            </div>
        </div>
    </div>
    <!-- edit modal -->
    <div class="modal fade" id="editModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editModalLabel">Edit User</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="edit-user-form" enctype="multipart/form-data">
                        <input type="hidden" name="id" id="edit-id">
                        <img id="edit-image-preview" src="" alt="Image Preview" class="img-thumbnail" width="100px">
                        <input type="hidden" name="existingImage" id="existingImage">
                        <div class="mb-3">
                            <label for="eventImage" class="form-label">Profile Picture</label>
                            <input type="file" class="form-control" id="profile_photo" name="profile_photo" accept="profile_photo/*">
                        </div>
                        <div class="mb-3">
                            <label for="edit-first-name" class="form-label">First Name</label>
                            <input type="text" class="form-control" id="first_name" name="first_name">
                        </div>
                        <div class="mb-3">
                            <label for="edit-last-name" class="form-label">Last Name</label>
                            <input type="text" class="form-control" id="last_name" name="last_name">
                        </div>
                        <!-- <div class="form-group">
                            <label for="gender">Gender</label>
                            <select class="form-control" name="gender" id="gender">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div> -->
                        <!-- <div class="mb-3">
                            <label for="edit-email" class="form-label">Email</label>
                            <input type="text" class="form-control" id="email" name="email">
                        </div> -->
                        <!-- <div class="mb-3">
                            <label for="edit-password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="password">
                        </div> -->
                        <div class="form-group">
                            <label for="from_country">Country</label>
                            <select class="form-control" name="from_country" id="from_country" required>
                                <option value="" disabled selected>Select country</option>
                                <!-- Add options here -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="current_province">Province</label>
                            <select class="form-control" name="current_province" id="current_province" required>
                                <option value="" disabled selected>Select province</option>
                                <!-- Add options here -->
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="edit-current-city" class="form-label">City</label>
                            <input type="text" class="form-control" id="current_city" name="current_city">
                        </div>
                        <!-- <div class="mb-3">
                            <label for="edit-current-barangay" class="form-label">Barangay</label>
                            <input type="text" class="form-control" id="current_barangay" name="current_barangay">
                        </div> -->
                        <input type="hidden" name="created_at">
                        <input type="hidden" name="updated_at">
                        <button type="submit" class="btn btn-primary" id="updateProfileButton">Save Changes</button>
                    </form>
                </div>

            </div>
        </div>
    </div>
    <!-- logout -->
    <div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Confirm Logout</h5>
                </div>
                <div class="modal-body">
                    Are you sure you want to logout?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelButton" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirmLogout">Logout</button>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.0/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>
    <script src="js/user-profile.js"></script>
    <?php include 'footer.php'; ?>
</body>

</html>