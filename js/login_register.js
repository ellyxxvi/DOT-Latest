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
// Initialize a flag to track registration status
let registrationSuccessful = false;
var config = {
    cUrl: 'https://api.countrystatecity.in/v1/countries',
    ckey: 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
};

var countrySelect = document.getElementById('from_country'),
    stateSelect = document.getElementById('current_province')
    // citySelect = document.getElementById('current_city');

function loadCountries() {

    let apiEndPoint = config.cUrl

    fetch(apiEndPoint, {headers: {"X-CSCAPI-KEY": config.ckey}})
    .then(Response => Response.json())
    .then(data => {
        // console.log(data);

        data.forEach(country => {
            const option = document.createElement('option')
            option.value = country.iso2
            option.textContent = country.name 
            countrySelect.appendChild(option)
        })
    })
    .catch(error => console.error('Error loading countries:', error))

    stateSelect.disabled = true
    // citySelect.disabled = true
    stateSelect.style.pointerEvents = 'none'
    // citySelect.style.pointerEvents = 'none'
}

function loadStates() {
    stateSelect.disabled = false
    // citySelect.disabled = true
    stateSelect.style.pointerEvents = 'auto'
    // citySelect.style.pointerEvents = 'none'

    const selectedCountryCode = countrySelect.value
    // console.log(selectedCountryCode);
    stateSelect.innerHTML = '<option value="">Select State</option>' // for clearing the existing states
    // citySelect.innerHTML = '<option value="">Select City</option>' // Clear existing city options

    fetch(`${config.cUrl}/${selectedCountryCode}/states`, {headers: {"X-CSCAPI-KEY": config.ckey}})
    .then(response => response.json())
    .then(data => {
        // console.log(data);

        data.forEach(state => {
            const option = document.createElement('option')
            option.value = state.iso2
            option.textContent = state.name 
            stateSelect.appendChild(option)
        })
    })
    .catch(error => console.error('Error loading countries:', error))
}

// function loadCities() {
//     citySelect.disabled = false
//     citySelect.style.pointerEvents = 'auto'

//     const selectedCountryCode = countrySelect.value
//     const selectedStateCode = stateSelect.value
//     // console.log(selectedCountryCode, selectedStateCode);

//     citySelect.innerHTML = '<option value="">Select City</option>' // Clear existing city options

//     fetch(`${config.cUrl}/${selectedCountryCode}/states/${selectedStateCode}/cities`, {headers: {"X-CSCAPI-KEY": config.ckey}})
//     .then(response => response.json())
//     .then(data => {
//         // console.log(data);

//         data.forEach(city => {
//             const option = document.createElement('option')
//             option.value = city.iso2
//             option.textContent = city.name 
//             citySelect.appendChild(option)
//         })
//     })
// }

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
     // Password toggle functionality
     const passwordInput2 = document.getElementById('password2');
     const passwordToggle2 = document.getElementById('password-toggle2');
 
     passwordToggle2.addEventListener('click', () => {
         if (passwordInput2.type === 'password') {
             passwordInput2.type = 'text';
             passwordToggle2.classList.remove('fa-eye-slash');
             passwordToggle2.classList.add('fa-eye');
         } else {
             passwordInput2.type = 'password';
             passwordToggle2.classList.remove('fa-eye');
             passwordToggle2.classList.add('fa-eye-slash');
         }
     });

    loadCountries(); 

    countrySelect.addEventListener('change', loadStates);

    // stateSelect.addEventListener('change');

    // Preference button functionality
    const preferenceButtons = document.querySelectorAll(".preference-button");
    preferenceButtons.forEach((button) => {
        button.addEventListener("click", function () {
            this.classList.toggle("selected");
        });
    });

    // Registration button functionality
    const registerButton = document.getElementById('registerButton');
    registerButton.addEventListener('click', () => {
        const user = collectUserData();
        registerUser(user);
    });

    // Save preferences button functionality
    const savePreferencesButton = document.getElementById('savePreferences');
    savePreferencesButton.addEventListener('click', () => {
        if (registrationSuccessful) {
            const selectedPreferences = collectSelectedPreferences();
            saveUserPreferences(selectedPreferences);
        } else {
            alert('User registration must be successful before saving preferences.');
        }
    });
    
});
window.onload = loadCountries


// Function to collect user registration data
function collectUserData() {
    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const gender = document.getElementById('gender').value;
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('password2').value;
    const from_country = countrySelect.options[countrySelect.selectedIndex].text;
    const current_province = stateSelect.options[stateSelect.selectedIndex].text;
    const current_city = document.getElementById('current_city').value;    

    const user = {
        first_name,
        last_name,
        gender,
        email,
        password,
        from_country,
        current_province,
        current_city,
        // current_barangay,
        role: "REGULAR" 
    };

    return user;
}

function registerUser(user) {
    const apiUrl = `${API_PROTOCOL}://${API_HOSTNAME}/users`;
    console.log('Sending user data to server:', user);
    console.log(from_country, current_province, current_city);


    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => {
        if (!response.ok) {
            // Parse the response as JSON to access the error details
            return response.json().then(responseData => {
                console.error(`Error creating user: ${response.status} ${response.statusText}`);

                if (responseData.name === 'ZodValidationError') {
                    console.error('Validation error details:', responseData.details);
                }

                alert('User registration failed. Please check your input data.');

                return Promise.reject(responseData);
            });
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('access_token', data.access_token);
        registrationSuccessful = true;
    })
    .catch(error => {
        // Handle any other errors that might have occurred
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


//LOGIN
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const staticBackdropModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
    const closeButton = staticBackdropModal._element.querySelector('.btn-close');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const passwordToggle = document.getElementById('password-toggle');

    passwordToggle.addEventListener('click', function () {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordToggle.classList.remove('fa-eye-slash');
            passwordToggle.classList.add('fa-eye');
        } else {
            passwordInput.type = 'password';
            passwordToggle.classList.remove('fa-eye');
            passwordToggle.classList.add('fa-eye-slash');
        }
    });

    if (loginButton) {
        // Function to handle form submission
        const handleLogin = () => {
            const email = emailInput.value;
            const password = passwordInput.value;

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
        };

        // Attach the handleLogin function to both click and Enter key press
        loginButton.addEventListener('click', handleLogin);

        // Listen for Enter key press in the email and password input fields
        emailInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                handleLogin();
            }
        });

        passwordInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                handleLogin();
            }
        });

        closeButton.addEventListener('click', () => {
            staticBackdropModal.hide();
        });
    }
});
