const API_PROTOCOL = 'https';
const API_HOSTNAME = 'goexplorebatangas.com/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const staticBackdropModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
    const closeButton = staticBackdropModal._element.querySelector('.btn-close');

    if (loginButton) {
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

        loginButton.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            let password = document.getElementById('password').value; 
            // Use the stored password variable in the POST request
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
                        const userRole = getRole(data.access_token);
    
                        if (userRole === 'SUPER_ADMIN') {
                            // Login for SUPER_ADMIN
                            localStorage.setItem('access_token_super_admin', data.access_token);
                        } else if (userRole === 'ADMIN') {
                            // Login for ADMIN
                            localStorage.setItem('access_token_admin', data.access_token);
                        }
                        localStorage.setItem('refresh_token', data.refresh_token);

                        console.log('Login successful');
                        window.location.href = 'index.html';
                    } else {
                        console.log('Invalid login');
                        staticBackdropModal.show();
                    }
                })
                .catch(error => {
                    console.error('Error checking login:', error);
                    if (error.response) {
                        console.error('Response status:', error.response.status);
                        error.response.text().then(text => {
                            console.error('Response text:', text);
                        });
                    }
                });
        });
    }
});

function getRole(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload).role;
}
