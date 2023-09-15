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

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.getElementById('registerButton');
    const savePreferencesButton = document.getElementById('savePreferences');

    // Event listener for registering
    registerButton.addEventListener('click', () => {
        // Collect form data
        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        const gender = document.getElementById('gender').value;
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const from_country = document.getElementById('from_country').value;
        const current_province = document.getElementById('current_province').value;
        const current_city = document.getElementById('current_city').value;
        const current_baranggay = document.getElementById('current_baranggay').value;

        // Create an object with the form data
        const user = {
            first_name,
            last_name,
            gender,
            email,
            password,
            from_country,
            current_province,
            current_city,
            current_baranggay
        };

        const date = new Date();
        let currentDay = String(date.getDate()).padStart(2, '0');
        let currentMonth = String(date.getMonth() + 1).padStart(2, '0');
        let currentYear = date.getFullYear();
        let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;
        user['created_at'] = currentDate;

        // Send POST request to JSON server to add the user
        fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
            console.log('User added:', data);
            localStorage.setItem('user_id', parseInt(data.id));
            alert('New user added, please proceed in logging in your account');
        })
        .catch(error => console.error('Error adding user:', error));
    });

    // Event listener for saving preferences
    savePreferencesButton.addEventListener('click', () => {
        const userId = parseInt(localStorage.getItem('user_id')); // Get the user's ID

        if (!userId) {
            console.error('User ID not found in local storage');
            return; // Abort if user ID is not found
        }

        const selectedPreferences = collectSelectedPreferences();

        // Save user preferences to localhost:3000/preference
        saveUserPreferences(userId, selectedPreferences);
    });
});

// Function to collect selected preferences
function collectSelectedPreferences() {
    const selectedPreferences = [];
    const preferenceButtons = document.querySelectorAll(".preference-button");

    preferenceButtons.forEach((button) => {
        if (button.classList.contains('selected')) {
            selectedPreferences.push({ category: button.getAttribute('value') });
        }
    });

    return selectedPreferences;
}

// Function to save user preferences to localhost:3000/preference
function saveUserPreferences(userId, selectedPreferences) {
    const userPreference = {
        user_id: userId,
        preferences: selectedPreferences
    };

    fetch('http://localhost:3000/preference', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userPreference)
    })
    .then(response => response.json())
    .then(data => {
        console.log('User preferences saved:', data);
        window.location.reload();
        preferenceModal.hide();
    })
    .catch(error => console.error('Error saving preferences:', error));
}

// login
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const staticBackdropModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
    const closeButton = staticBackdropModal._element.querySelector('.btn-close');

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('http://localhost:3001/auth/user', {
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



