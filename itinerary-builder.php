<!DOCTYPE html>
<html lang="en">
<?php include 'header.php'; ?>

<head>
    <link rel="icon" type="image/png" href="images/logo_tab.png" sizes="64x64">
    <title>Itinerary Builder</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap CSS CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.0/css/bootstrap.min.css">

    <link rel="stylesheet" href="css/itinerary-builder.css" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <link rel="icon" href="image/LOGO (2).png" type="image/png">

    <!-- for calendar -->
    <!-- <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" rel="stylesheet"> -->
    <!-- <link href="https://maxcdn.icons8.com/fonts/line-awesome/1.1/css/line-awesome-font-awesome.min.css" rel="stylesheet"> -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/air-datepicker/2.2.3/css/datepicker.css" rel="stylesheet">

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

    <div class="p-5">
        <h2 class="mb-4">Calendar</h2>
        <div class="card">
            <div class="card-body p-0">
                <div id="calendar"></div>
            </div>
        </div>
    </div>

    <!-- calendar modal -->
    <div id="modal-view-event" class="modal modal-top fade calendar-modal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body">
                    <h4 class="modal-title"><span class="event-icon"></span><span class="event-title"></span></h4>
                    <div class="event-body"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <div id="modal-view-event-add" class="modal modal-top fade calendar-modal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <form id="add-event">
                    <div class="modal-body">
                        <h4>Add Event Detail</h4>
                        <div class="form-group">
                            <label>Place name</label>
                            <select class="form-control" name="place_name" id="place_name"></select>
                        </div>
                        <div class="form-group">
                            <label>Event Date</label>
                            <input type="text" class="datetimepicker form-control" name="event_date" id="event_date">
                        </div>
                        <div class="form-group">
                            <label>Notes</label>
                            <input type="text" class="form-control" name="notes" id="notes">
                        </div>
                        <div class="form-group">
                            <label>Event Color</label>
                            <select class="form-control" name="event_color" id="event_color">
                                <option value="fc-bg-default">fc-bg-default</option>
                                <option value="fc-bg-green">fc-bg-green</option>
                                <option value="fc-bg-yellow">fc-bg-yellow</option>
                                <option value="fc-bg-purple">fc-bg-purple</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Event Icon</label>
                            <select class="form-control" name="event_icon" id="event_icon">
                                <option value="circle">circle</option>
                                <option value="cog">cog</option>
                                <option value="group">group</option>
                                <option value="suitcase">suitcase</option>
                                <option value="calendar">calendar</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Save</button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                    </div>
                </form>
            </div>
        </div>
    </div>



    <h1>NOTES</h1>
    <section id="notes-section" class="container">
        <div class="row" id="notes-row">
            <!-- Cards will be generated here -->
        </div>
    </section>

    <!-- Edit Event Modal -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <form id="edit-event">
                    <div class="modal-body">
                        <h4>Edit Event Detail</h4>
                        <div class="form-group">
                            <label>Place name</label>
                            <select class="form-control" name="place_name" id="edit_place_name"></select>
                        </div>
                        <div class="form-group">
                            <label>Event Date</label>
                            <input type='text' class="datetimepicker form-control" name="event_date" id="edit_event_date">
                        </div>
                        <div class="form-group">
                            <label>Notes</label>
                            <input type="text" class="form-control" name="notes" id="edit_notes">
                        </div>
                        <div class="form-group">
                            <label>Event Color</label>
                            <select class="form-control" name="event_color" id="edit_event_color">
                                <option value="fc-bg-default">fc-bg-default</option>
                                <option value="fc-bg-green">fc-bg-green</option>
                                <option value="fc-bg-yellow">fc-bg-yellow</option>
                                <option value="fc-bg-purple">fc-bg-purple</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Event Icon</label>
                            <select class="form-control" name="event_icon" id="edit_event_icon">
                                <option value="circle">circle</option>
                                <option value="cog">cog</option>
                                <option value="group">group</option>
                                <option value="suitcase">suitcase</option>
                                <option value="calendar">calendar</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary" id="edit_button">Save</button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.0/js/bootstrap.bundle.min.js"></script>
    <script src="js/itinerary-builder.js"></script>

    <!-- for calendar -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/air-datepicker/2.2.3/js/datepicker.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/air-datepicker/2.2.3/js/i18n/datepicker.en.js"></script>

    <!-- footer -->
    <?php include 'footer.php'; ?>
</body>

</html>