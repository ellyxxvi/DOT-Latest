document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const staticBackdropModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
    const closeButton = staticBackdropModal._element.querySelector('.btn-close'); 

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('http://localhost:3001/auth/admin', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }) // Use the entered email and password
            })
            .then(response => response.json())
            .then(data => {
                if (data.access_token && data.refresh_token) {
                    // Valid login
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);

                    console.log(data);
                    console.log('Login successful');
                    window.location.href = 'index.html'; 
                } else {
                    // Invalid login
                    console.log('Invalid login');
                    staticBackdropModal.show();
                }
            })
            .catch(error => console.error('Error checking login:', error));
        });

        // Close the modal when clicking on the close button
        closeButton.addEventListener('click', () => {
            staticBackdropModal.hide();
        });
    }
});
