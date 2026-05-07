// Submit form data to the server
document.getElementById('addListingForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(event.target);

    // Convert form data to JSON object for easier handling
    const listingData = {};
    formData.forEach((value, key) => {
        listingData[key] = value;
    });

    try {
        const response = await fetch('/add-listing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Ensure proper JSON header
            },
            body: JSON.stringify(listingData),
        });

        if (response.ok) {
            alert('Listing added successfully!');
            event.target.reset();
            document.getElementById('individualFields').style.display = 'none';
            document.getElementById('routeFields').style.display = 'none';
            document.getElementById('businessFields').style.display = 'none';
        } else {
            const errorMessage = await response.text();
            alert('Error adding listing: ' + errorMessage);
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
});


