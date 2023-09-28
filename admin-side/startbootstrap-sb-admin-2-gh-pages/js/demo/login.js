const API_PROTOCOL = 'http';
const API_HOSTNAME = '13.229.106.142';

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

                        // Log the user response
                        console.log('User response:', data);
                        console.log('Login successful');
                        window.location.href = 'index.html';
                    } else {
                        // Invalid login
                        console.log('Invalid login');
                        staticBackdropModal.show();
                    }
                })
                .catch(error => {
                    // Log the error
                    console.error('Error checking login:', error);
                    if (error.response) {
                        console.error('Response status:', error.response.status);
                        error.response.text().then(text => {
                            // Log the error response text
                            console.error('Response text:', text);
                        });
                    }
                });
        });

        // Close the modal when clicking on the close button
        closeButton.addEventListener('click', () => {
            staticBackdropModal.hide();
        });
    }
});
