$(document).ready(function () {
    $('.login-info-box').fadeOut();
    $('.login-show').addClass('show-log-panel');
});
$('.preference-button').click(function () {
    $(this).toggleClass('active');
});

$('.login-reg-panel input[type="radio"]').on('change', function () {
    if ($('#log-login-show').is(':checked')) {
        if (screen.width > 768) {
            $('.register-info-box').fadeOut();
            $('.login-info-box').fadeIn();
        }
        $('.white-panel').addClass('right-log');
        $('.register-show').addClass('show-log-panel');
        $('.login-show').removeClass('show-log-panel');

    } else if ($('#log-reg-show').is(':checked')) {
        if (screen.width > 768) {
            $('.register-info-box').fadeIn();
            $('.login-info-box').fadeOut();
        }

        $('.white-panel').removeClass('right-log');

        $('.login-show').addClass('show-log-panel');
        $('.register-show').removeClass('show-log-panel');
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const preferenceButtons = document.querySelectorAll(".preference-button");

    preferenceButtons.forEach((button) => {
        button.addEventListener("click", function () {
            this.classList.toggle("selected");
        });
    });
});

// Initialize a flag to track registration status
let registrationSuccessful = false;

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.getElementById('registerButton');
    const savePreferencesButton = document.getElementById('savePreferences');

    // Event listener for registering
    registerButton.addEventListener('click', () => {
        // Collect form data
        const user = collectUserData();

        // Send POST request to JSON server to add the user
        registerUser(user);
    });

    // Event listener for saving preferences
    savePreferencesButton.addEventListener('click', () => {
        // Check if registration was successful before opening the preference modal
        if (registrationSuccessful) {
            const selectedPreferences = collectSelectedPreferences();

            // Save user preferences to the correct URL
            saveUserPreferences(selectedPreferences);
        } else {
            alert('User registration must be successful before saving preferences.');

        }
    });
});

// Function to collect user registration data
function collectUserData() {
    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const gender = document.getElementById('gender').value;
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const from_country = document.getElementById('from_country').value;
    const current_province = document.getElementById('current_province').value;
    const current_city = document.getElementById('current_city').value;
    const current_barangay = document.getElementById('current_barangay').value;

    // Create an object with the user registration data
    const user = {
        first_name,
        last_name,
        gender,
        email,
        password,
        from_country,
        current_province,
        current_city,
        current_barangay,
        role: "REGULAR" // Add the role field with the value "REGULAR"
    };

    return user;
}

// Function to register a new user
function registerUser(user) {
    const apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/users`;

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(responseData => {
                console.error(`Error creating user: ${response.status} ${response.statusText}`);
                console.error('Server response:', responseData);
                alert('User registration failed. Please check your input data.');
                throw new Error('User registration failed.');
            });
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('access_token', (data.access_token));
        //localStorage.setItem('user_id', (data.id));
       

        // Set the registrationSuccessful flag to true
        registrationSuccessful = true;
    })
    .catch(error => {
        console.error('Error creating user:', error);
    });
}

// Function to collect selected preferences
function collectSelectedPreferences() {
    const selectedPreferences = [];
    const preferenceButtons = document.querySelectorAll(".preference-button");

    preferenceButtons.forEach(button => {
        if (button.classList.contains('selected')) {
            selectedPreferences.push({ category: button.getAttribute('value') });
        }
    });

    return selectedPreferences;
}

// Function to save user preferences
function saveUserPreferences(selectedPreferences) {
    const token = localStorage.getItem('access_token');

    const userPreference = {
        preferenced_categories: selectedPreferences.map(pref => pref.category)
    };

    fetch(`${API_PROTOCOL}://${API_HOSTNAME}/preferences`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userPreference)
    })
    .then(response => {
        if (!response.ok) {
            console.error(`Error saving preferences: ${response.status} ${response.statusText}`);
            return response.json().then(responseData => {
                console.error('Server response:', responseData);
                throw new Error('User preferences could not be saved.');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('New user added. Please proceed to log in to your account.');
        window.location.reload();
    })
    .catch(error => console.error('Error saving preferences:', error));
}



//login
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const staticBackdropModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
    const closeButton = staticBackdropModal._element.querySelector('.btn-close');

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch(`${API_PROTOCOL}://${API_HOSTNAME}/auth/login`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.access_token && data.refresh_token) {
                        // Valid login
                        localStorage.setItem('access_token', data.access_token);
                        localStorage.setItem('refresh_token', data.refresh_token);
                        localStorage.setItem('user_data', JSON.stringify(data.user_data));
                        window.location.href = 'itinerary_favorites.php';
                    } else {
                        // Invalid login
                        console.log('Invalid login');
                        staticBackdropModal.show();
                    }
                })
                .catch(error => console.error('Error checking login:', error));
        });

        closeButton.addEventListener('click', () => {
            staticBackdropModal.hide();
        });
    }
});
