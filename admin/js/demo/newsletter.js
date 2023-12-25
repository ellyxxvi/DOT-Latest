// Modal for adding a user
$(document).ready(function () {
    $("#addButton").click(function () {
        $("#addModal").modal("show");
    });
});
const API_PROTOCOL = 'https'
const API_HOSTNAME = 'goexplorebatangas.com/api'
// const API_PROTOCOL = 'http'
// const API_HOSTNAME = '13.229.101.17/api'


// NEWSLETTER
document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('tableBody');
    const filterByPreferences = document.getElementById('filterByPreferences');
    const logoutButton = document.getElementById('logoutButton');

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('access_token_super_admin');
        localStorage.removeItem('access_token_admin');
        window.location.href = 'login.html';
    });

    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    if (!accessToken) {
        window.location.href = 'login.html';
        return;
    }

    const userRole = getUserRoleFromAccessToken();

    if (userRole === 'ADMIN') {
        // Hide the navigation items
        const adminManagementNavItem = document.getElementById('adminManagement');
        const userManagementNavItem = document.getElementById('userManagement');

        if (adminManagementNavItem) {
            adminManagementNavItem.style.display = 'none';
        }

        if (userManagementNavItem) {
            userManagementNavItem.style.display = 'none';
        }
    } else if (userRole !== 'SUPER_ADMIN') {
        window.location.href = 'index.html';
        return;
    }


    populateTable();

    async function handleErrors(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return await response.json();
    }

    async function populateTable() {
        const accessToken = getAccessTokenFromLocalStorage();
        const searchUrl = `${API_PROTOCOL}://${API_HOSTNAME}/newsletters/users/`;
    
        try {
            const response = await fetch(searchUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Access-Control-Allow-Origin': '*'
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
    
            const data = await response.json();
    
            console.log('Fetched data:', data); // Log the fetched data
    
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            tableBody.innerHTML = '';
    
            if (data.length === 0) {
                const noResultsRow = document.createElement('tr');
                noResultsRow.innerHTML = `
                    <td colspan="13" style="text-align: center;">There are no relevant search results.</td>
                `;
                tableBody.appendChild(noResultsRow);
            } else {
                data.forEach(user => {
                    const row = document.createElement('tr');
    
                    const checkboxCell = document.createElement('td');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.dataset.userId = user.id; 
                    checkbox.dataset.userEmail = user.email;                    
                    checkboxCell.appendChild(checkbox);
                    row.appendChild(checkboxCell);
    
                    row.innerHTML += `
                        <td>${user.first_name}</td>
                        <td>${user.last_name}</td>
                        <td>${user.email}</td>
                        <td>${user.current_province}</td>
                        <td>${user.current_city}</td>
                    `;
    
                    // Convert preferenced_categories to bullet points
                    const preferencesCell = document.createElement('td');
                    const preferencesList = document.createElement('ul');
                    user.preferenced_categories.forEach(category => {
                        const preferenceItem = document.createElement('li');
                        preferenceItem.textContent = category;
                        preferencesList.appendChild(preferenceItem);
                    });
                    preferencesCell.appendChild(preferencesList);
                    row.appendChild(preferencesCell);
    
                    tableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    
    // Call the function to populate the table
    populateTable();
    
    const addButton = document.getElementById('addButton');
    addButton.addEventListener('click', handleSendRecommendation);
    
    function handleSendRecommendation() {
        const selectedUsers = getSelectedUsers();
        if (selectedUsers.length === 0) {
            alert('Please select at least one user.');
            return;
        }
    
        sendRecommendation(selectedUsers);
    }
    
    function getSelectedUsers() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const selectedUsers = [];
    
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const user = {
                    user_id: checkbox.dataset.userId,
                    user_email: checkbox.dataset.userEmail,
                };
                selectedUsers.push(user);
            }
        });
    
        return selectedUsers;
    }
    
    
    
    async function sendRecommendation(users) {
        const endpoint = `${API_PROTOCOL}://${API_HOSTNAME}/newsletters`;
    
        try {
            console.log('Sending recommendation payload:', JSON.stringify({ users }));
    
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ users }),
            });
    
            if (!response.ok) {
                console.error('Error sending recommendation. Status:', response.status);
                const responseBody = await response.json();
                console.error('Response Body:', responseBody);
    
                if (responseBody.name === 'ZodValidationError') {
                    console.error('ZodValidationError Details:', responseBody.details);
                    // Handle validation errors, e.g., display to the user
                    alert(`Validation Error: ${responseBody.details.map(detail => detail.message).join('\n')}`);
                }
    
                throw new Error('Error sending recommendation.');
            }
    
            // Handle success, e.g., show a success message
            alert('Recommendation sent successfully!');
        } catch (error) {
            console.error('Error sending recommendation:', error);
            // Handle error, e.g., show an error message
            alert('Error sending recommendation. Please try again.');
        }
    }
    
    
    
    
    

    function getAccessTokenFromLocalStorage() {
        const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
        return accessToken;
    }
});

function getUserRoleFromAccessToken() {
    const accessToken = localStorage.getItem('access_token_super_admin') || localStorage.getItem('access_token_admin');
    if (!accessToken) return null;

    var base64Url = accessToken.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload).role;
}

// Get the user's role and update the UI
var userRole = getUserRoleFromAccessToken();

if (userRole) {
    var userDropdown = document.getElementById('userDropdown');
    var roleElement = userDropdown.querySelector('.role');

    if (userRole === 'SUPER_ADMIN') {
        roleElement.innerText = 'SUPER ADMIN';
    } else if (userRole === 'ADMIN') {
        roleElement.innerText = 'ADMIN/STAFF';
    }
}
