
const API_BASE_URL = 'http://localhost:5000/api/vehicles';

$(document).ready(function() {
    

    function showMessage(message, isError = false) {
        const msgBox = $('#message-box');
        msgBox.text(message);
        msgBox.removeClass('alert-success alert-danger');
        
        if (isError) {
            msgBox.addClass('alert-danger');
        } else {
            msgBox.addClass('alert-success');
        }
        
        msgBox.fadeIn().delay(3000).fadeOut();
    }

    $('#register-form').submit(function(e) {
        e.preventDefault(); 


        const regNo = $('#regNo').val().trim();
        const firstName = $('#firstName').val().trim();
        const email = $('#email').val().trim();

        if (regNo === '' || firstName === '' || email === '') {
            showMessage('Please fill in all required fields!', true);
            return;
        }


        const vehicleData = {
            RegNo: regNo,
            FirstName: firstName,
            LastName: $('#lastName').val().trim(),
            Email: email,
            NearestStation: $('#nearestStation').val().trim(),
            FuelType: $('#fuelType').val(),
            OwnerNIC: $('#ownerNIC').val().trim(),
            VehicleModel: $('#vehicleModel').val().trim(),
            QRCode: `RegNo: ${regNo}, Name: ${firstName} ${$('#lastName').val().trim()}, NIC: ${$('#ownerNIC').val().trim()}, FuelType: ${$('#fuelType').val()}`
        };


        $.ajax({
            url: API_BASE_URL + '/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(vehicleData),
            success: function(response) {
                showMessage('Vehicle registered successfully!');
                $('#register-form')[0].reset();
            },
            error: function(xhr) {
                showMessage('Error: ' + (xhr.responseJSON?.message || 'Registration failed'), true);
            }
        });
    });

    if ($('#vehicles-table-body').length) {
        fetchAndDisplayVehicles(API_BASE_URL);
    }


    $('#search-btn').click(function() {
        const searchBy = $('#searchBy').val();
        const searchTerm = $('#searchTerm').val().trim();

        if (searchTerm === '') {
            showMessage('Please enter a search term', true);
            return;
        }

        let searchUrl = API_BASE_URL;
        

        switch(searchBy) {
            case 'regno': searchUrl += `/regno/${searchTerm}`; break;
            case 'firstname': searchUrl += `/firstname/${searchTerm}`; break;
            case 'lastname': searchUrl += `/lastname/${searchTerm}`; break;
            case 'email': searchUrl += `/email/${searchTerm}`; break;
            case 'station': searchUrl += `/station/${searchTerm}`; break;
            case 'fueltype': searchUrl += `/fueltype/${searchTerm}`; break;
            case 'nic': searchUrl += `/nic/${searchTerm}`; break;
        }

        fetchAndDisplayVehicles(searchUrl);
    });


    function fetchAndDisplayVehicles(url) {
        $.ajax({
            url: url,
            type: 'GET',
            success: function(data) {
                const tbody = $('#vehicles-table-body');
                tbody.empty(); 

                const vehicles = Array.isArray(data) ? data : [data];

                if (vehicles.length === 0 || !vehicles[0]) {
                    tbody.append('<tr><td colspan="9" class="text-center">No vehicles found</td></tr>');
                    return;
                }

                vehicles.forEach(v => {
                    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(v.QRCode)}`;
                    const row = `
                        <tr>
                            <td>${v.RegNo}</td>
                            <td>${v.FirstName} ${v.LastName}</td>
                            <td>${v.Email}</td>
                            <td>${v.NearestStation}</td>
                            <td>${v.FuelType}</td>
                            <td>${v.OwnerNIC}</td>
                            <td>${v.VehicleModel}</td>
                            <td><img src="${qrImageUrl}" alt="QR Code" width="100" height="100" class="img-thumbnail"></td>
                        </tr>
                    `;
                    tbody.append(row); 
                });
            },
            error: function() {
                const tbody = $('#vehicles-table-body');
                tbody.empty();
                tbody.append('<tr><td colspan="9" class="text-center text-danger">Error fetching data</td></tr>');
            }
        });
    }

    $('#fetch-update-btn').click(function() {
        const regNo = $('#updateSearchRegNo').val().trim();
        if (regNo === '') {
            showMessage('Please enter a Registration Number', true);
            return;
        }

        $.ajax({
            url: `${API_BASE_URL}/regno/${regNo}`,
            type: 'GET',
            success: function(vehicle) {
                $('#updFirstName').val(vehicle.FirstName);
                $('#updLastName').val(vehicle.LastName);
                $('#updNearestStation').val(vehicle.NearestStation);
                $('#updFuelType').val(vehicle.FuelType);
                
                $('#update-form-section').fadeIn();
                showMessage('Vehicle found. You can now update details.');
            },
            error: function() {
                $('#update-form-section').fadeOut();
                showMessage('Vehicle not found!', true);
            }
        });
    });

    $('#update-form').submit(function(e) {
        e.preventDefault();
        
        const regNo = $('#updateSearchRegNo').val().trim();
        const updatedData = {
            FirstName: $('#updFirstName').val().trim(),
            LastName: $('#updLastName').val().trim(),
            NearestStation: $('#updNearestStation').val().trim(),
            FuelType: $('#updFuelType').val()
        };

        $.ajax({
            url: `${API_BASE_URL}/regno/${regNo}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedData),
            success: function(response) {
                showMessage('Vehicle updated successfully!');
                $('#update-form-section').fadeOut();
            },
            error: function(xhr) {
                showMessage('Error updating vehicle', true);
            }
        });
    });


    $('#delete-btn').click(function() {
        const regNo = $('#deleteRegNo').val().trim();
        if (regNo === '') {
            showMessage('Please enter a Registration Number', true);
            return;
        }

        if(confirm(`Are you sure you want to delete vehicle ${regNo}?`)) {
            $.ajax({
                url: `${API_BASE_URL}/regno/${regNo}`,
                type: 'DELETE',
                success: function(response) {
                    showMessage('Vehicle deleted successfully!');
                    $('#deleteRegNo').val(''); 
                },
                error: function(xhr) {
                    showMessage('Vehicle not found or could not be deleted', true);
                }
            });
        }
    });

});
