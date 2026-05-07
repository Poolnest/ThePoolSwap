document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveSinglestopListing');
    if (!saveButton) {
        console.error('Save button not found.');
        return;
    }

    saveButton.addEventListener('click', async () => {
        const streetAddress = document.getElementById('streetAddress')?.value.trim();
        const city          = document.getElementById('city')?.value.trim();
        const state         = document.getElementById('state')?.value.trim();
        const zipCode       = document.getElementById('zipCode')?.value.trim();
        const monthlyIncome = document.getElementById('monthlyIncome')?.value.trim();
        const askingPrice   = document.getElementById('askingPrice')?.value.trim();

        if (!streetAddress || !city || !state || !zipCode) {
            alert('Please fill out all required fields.');
            return;
        }

        const formData = {
            listingType: 'individual',
            streetAddress,
            city,
            state,
            zipCode,
            monthlyIncome: monthlyIncome || null,
            askingPrice:   askingPrice   || null,
        };

        try {
            const response = await fetch('/add-listing', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert('Listing saved successfully!');
            document.getElementById('singlestopForm').reset();
        } catch (error) {
            console.error('Error saving listing:', error.message);
            alert(`Error saving listing: ${error.message}`);
        }
    });
});