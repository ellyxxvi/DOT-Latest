<!DOCTYPE html>
<html>

<head>
    <title>LOG-IN/REGISTER</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">

    <script src="https://kit.fontawesome.com/83c0f4a797.js" crossorigin="anonymous"></script>

    <link href="css/login_register.css" rel="stylesheet">
    <link rel="icon" href="image/LOGO (2).png" type="image/png">
</head>

<body>
    <?php include 'header.php'; ?>
    <div class="section" style="background-image: url('image/bg.png'); background-size: cover; background-position: center;">
        <div class="login-reg-panel">
            <div class="login-info-box">
                <h2>Have an account?</h2>
                <p>Log in to unlock the best of Go Explore</p>
                <label id="label-register" for="log-reg-show">Login</label>
                <input type="radio" name="active-log-panel" id="log-reg-show" checked="checked">
            </div>

            <div class="register-info-box">
                <h2>Don't have an account?</h2>
                <p>Sign in to unlock the best of Go Explore</p>
                <label id="label-login" for="log-login-show">Register</label>
                <input type="radio" name="active-log-panel" id="log-login-show">
            </div>

            <div class="white-panel">
                <div class="login-show">
                    <h2>LOGIN</h2>
                    <input type="text" placeholder="Email" name="email" id="email">
                    <div class="password-container">
                        <input type="password" placeholder="Password" name="password" id="password">
                        <i class="password-toggle fa fa-eye-slash" id="password-toggle"></i>
                    </div>
                    <input type="button" value="Login" id="loginButton">
                    <p><br><br><br>This site is protected by reCAPTCHA and the <a href="https://policies.google.com/privacy?hl=en-US">Google Privacy Policy</a> and <a href="https://policies.google.com/terms?hl=en-US">Terms of Service</a> apply.</p>
                </div>
                <div class="register-show" id="registrationForm">
                    <h2>REGISTER</h2>
                    <input type="text" placeholder="First Name" name="first_name" id="first_name" autocomplete="off" required>
                    <input type="text" placeholder="Last Name" name="last_name" id="last_name" autocomplete="off" required>
                    <div class="form-group">
                        <select class="form-control" name="gender" id="gender" required>
                            <option disabled selected value="">Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <input type="text" placeholder="Email" name="email" id="emailInput" autocomplete="off" required>
                    <div class="password-container">
                        <input type="password" placeholder="Password" name="password" id="password2">
                        <i class="password-toggle fa fa-eye-slash" id="password-toggle2"></i>
                    </div>
                    <select name="from_country" id="from_country" required>
                        <option value="" disabled selected>Country</option>
                    </select>
                    <select name="current_province" id="current_province" required>
                        <option value="" disabled selected>Province</option>
                    </select>
                    <input type="text" placeholder="City" name="city" id="current_city" autocomplete="off" required>
                    <!-- <input type="text" placeholder="Barangay" name="current_barangay" id="current_barangay" autocomplete="off" required> -->
                    <input type="button" id="registerButton" value="Register" data-toggle="modal" data-target="#preferenceModal">
                    <p id="warning" style="color: red; display: none;">Please fill in all required fields.</p>
                </div>
                <div class="login-reg-panel-mini">
                    <div class="login-info-box-mini">
                        <h2>Have an account?</h2>
                        <p>Log in to unlock the best of Go Explore</p>
                        <label id="label-register" for="log-reg-show">Login</label>
                        <input type="radio" name="active-log-panel" id="log-reg-show" checked="checked">
                    </div>
                    <div class="register-info-box-mini">
                        <h2>Don't have an account?</h2>
                        <p>Sign in to unlock the best of Go Explore</p>
                        <label id="label-login" for="log-login-show">Register</label>
                        <input type="radio" name="active-log-panel" id="log-login-show">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="errorModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <p>Invalid login. Please check your credentials.</p>
        </div>
    </div>


    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Attention</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Invalid Input. Please check your credentials
                </div>
            </div>
        </div>
    </div>

    <!-- Preference Modal -->
    <div class="modal fade" id="preferenceModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editModalLabel">User Preference</h5>
                
                </div>
                <div class="modal-body">
                    <div class="container">
                        <h6>Please choose what you are interested in the most:</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="preference-button btn btn-swim" id="preferenceSwim" value="Swim and Beaches">
                                    <i class="fas fa-swimmer"></i> Swim and Beaches
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="preference-button btn btn-nature" id="preferenceNature" value="Nature Trip">
                                    <i class="fas fa-tree"></i> Nature Trip
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="preference-button btn btn-churches" id="preferenceChurches" value="Churches">
                                    <i class="fas fa-church"></i> Churches
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="preference-button btn btn-events" id="preferenceEvents" value="Events and Culture">
                                    <i class="fas fa-calendar-alt"></i> Events and Culture
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="preference-button btn btn-hotel" id="preferenceHotel" value="Hotel">
                                    <i class="fas fa-hotel"></i> Hotel
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="preference-button btn btn-tourist-spots" id="preferenceTouristSpots" value="Tourist Spots">
                                    <i class="fas fa-camera"></i> Tourist Spots
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <!-- <button type="button" class="btn btn-default" data-dismiss="modal">Skip</button> -->
                    <button type="button" class="btn btn-primary" id="savePreferences">Save Preferences</button>
                </div>
            </div>
        </div>
    </div>



    <?php include 'footer.php'; ?>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/login_register.js"></script>
</body>

</html>