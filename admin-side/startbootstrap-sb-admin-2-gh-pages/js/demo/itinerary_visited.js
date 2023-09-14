$(document).ready(function () {
    $('#dataTable').DataTable();
  });
  
  document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('tableBody');
  
    function populateTable() {
        fetch('http://localhost:3000/itinerary_visited')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched data:', data); 
                if (Array.isArray(data)) {
                    tableBody.innerHTML = ''; 
                    data.forEach(user => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.id}</td>
                            <td>${user.place_id}</td>
                            <td>${user.user_id}</td>
                            <td>${user.ratings}</td>
                            <td>${user.comment}</td>
                            <td>${user.created_at}</td>
                            <td>${user.updated_at}</td>
                        `;
                        tableBody.appendChild(row);
                    });
                } else {
                    console.error('Fetched data is not an array:', data);
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }
  
    populateTable();
  });
  