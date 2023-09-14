
  
  // modal for add event
  $(document).ready(function () {
    $("#addButton1").click(function () {
      $("#addEventModal1").modal("show");
    });
  });
  
//   THINGS TO BRING 
  document.addEventListener('DOMContentLoaded', function () {
    const tableBody1 = document.getElementById('tableBody1');
    const addButton1 = document.getElementById('addButton1');
    const addEventModal1 = new bootstrap.Modal(document.getElementById('addEventModal1'));
    const addAccountButton1 = document.getElementById('btn-add-account1');
    const editModal1 = new bootstrap.Modal(document.getElementById('editModal1')); 
    const editForm1 = document.getElementById('edit-user-form1'); 
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
  
    function populateTable(searchKeyword = '') {
      let searchUrl = 'http://localhost:3000/stufftoremember';
  
      fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
          const filteredData = data.filter(user => {
            return user.title.includes(searchKeyword) || user.description.includes(searchKeyword);
          });
          tableBody1.innerHTML = ''; 
          if (filteredData.length === 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `
                <td colspan="7" style="text-align: center;">There are no relevant search results.</td>
                `;
            tableBody1.appendChild(noResultsRow);
          } else {
            filteredData.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                          <td>${user.id}</td>
                          <td><img src=${user.image} alt=""
                          class="img-thumbnail" width="100px"></td>
                          <td>${user.title}</td>
                          <td>${user.description}</td>
                          <td>${user.created_at}</td>
                          <td>${user.updated_at}</td>
                          <!-- ... Other cells ... -->
                          <td>
                              <button class="btn btn-primary btn-sm edit-button1" data-user-id="${user.id}">
                                  <i class="fa fa-pen"></i>
                              </button>
                              <button class="btn btn-danger btn-sm delete-button">
                                  <i class="fa fa-trash"></i>
                              </button>
                          </td>
                      `;
            tableBody1.appendChild(row);
          });
        }
          const deleteButtons = document.querySelectorAll('.delete-button');
          deleteButtons.forEach(button => {
            button.addEventListener('click', deleteRow);
          });
  
          const editButtons = document.querySelectorAll('.edit-button1');
          editButtons.forEach(button => {
            button.addEventListener('click', editRow1);
          });
  
        })
        .catch(error => console.error('Error fetching data:', error));
    }
    populateTable();

    searchButton.addEventListener('click', () => {
      const searchKeyword = searchInput.value.trim();
      console.log('Search keyword:', searchKeyword);
      populateTable(searchKeyword);
    });
    const addForm = document.getElementById('add-user-form1');
  
//   EDIT
    function editRow1(event) {
      const button = event.target;
      const row = button.closest('tr');
      const userId = row.querySelector('td:first-child').textContent;
      fetch(`http://localhost:3000/stufftoremember/${userId}`)
        .then(response => response.json())
        .then(user => {
          const date = new Date();
          let currentDay = String(date.getDate()).padStart(2, '0');
          let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
          let currentYear = date.getFullYear();
          let updated_at = `${currentDay}-${currentMonth}-${currentYear}`;
  
          editForm1.elements.id.value = user.id;
          // editForm.elements.image.value = user.image;
          editForm1.elements.title.value = user.title;
          editForm1.elements.description.value = user.description;
          editForm1.elements.created_at.value = user.created_at;
          editForm1.elements.updated_at.value = updated_at;

          // Get the existing image URL from the table row
          const existingImageCell = row.querySelector('td:nth-child(2)');
          const existingImageURL = existingImageCell.querySelector('img').getAttribute('src');
          editForm1.elements.existingImage.value = existingImageURL;

  
          editModal1.show();
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  
    editForm1.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(editForm1);
      const updatedUser = {};
      formData.forEach((value, key) => {
        updatedUser[key] = value;
      });
  
      const imageInput = editForm1.querySelector('input[type="file"]');
      const imageFile = imageInput.files[0];
  
      if (imageFile) {
        var formData2 = new FormData();
        formData2.append('image', imageFile);
  
        fetch('http://localhost:3001/images', {
          method: 'POST',
          body: formData2
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Network response was not ok.');
            }
          })
          .then(data => {
            console.log('Uploaded image URL:', data.url);
            updatedUser.image = data.url;
  
            sendEditRequest(updatedUser);
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
          });
      } else {
        sendEditRequest(updatedUser);
      }
    });
  

    function sendEditRequest(updatedUser) {
      fetch(`http://localhost:3000/stufftoremember/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      })
        .then(response => response.json())
        .then(data => {
          editForm1.reset();
          editModal1.hide();
          populateTable();
        })
        .catch(error => console.error('Error updating item data:', error));
    }
  
  
// ADD
    addButton1.addEventListener('click', () => {
      addEventModal1.show();
    });
  
    // Handle form submission and add new item
    addAccountButton1.addEventListener('click', () => {
      const form = document.getElementById('add-user-form1');
      const formData = new FormData(form);
      const imageInput = addForm.querySelector('input[type="file"]');
      const imageFile = imageInput.files[0];
  
      if (imageFile) {
        formData.delete('image');
        formData.append('image', imageFile);
      }
  
      var formData2 = new FormData();
      formData2.append('image', imageFile);
  
      fetch('http://localhost:3001/images', {
        method: 'POST',
        body: formData2
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Network response was not ok.');
          }
        })
        .then(data => {
          console.log('Uploaded image URL:', data.url);
          const imageDataUrl = data.url;
  
          const date = new Date();
          let currentDay = String(date.getDate()).padStart(2, '0');
          let currentMonth = String(date.getMonth() + 1).padStart(2, "0");
          let currentYear = date.getFullYear();
          let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;
  
          const user = {
            ...Object.fromEntries(formData.entries()),
            image: imageDataUrl,
            created_at: currentDate
          };

          fetch('http://localhost:3000/stufftoremember', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
          })
            .then(response => response.json())
            .then(data => {
              form.reset();
              this.location.reload();
              populateTable();
            })
            .catch(error => console.error('Error adding item:', error));
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
    });
  
// DELETE
    function deleteRow(event) {
      const button = event.target;
      const row = button.closest('tr');
      const userId = row.querySelector('td:first-child').textContent;
  
      fetch(`http://localhost:3000/stufftoremember/${userId}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(() => {
          row.remove();
        })
        .catch(error => console.error('Error deleting user:', error));
    }
  
    // Populate the table on page load
    populateTable();
  
  });  
  