document.addEventListener('DOMContentLoaded', function () {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownOptions = document.getElementById('dropdownOptions');
    const dropdownOptionsList = document.querySelectorAll('.dropdown-option');
    const typeOfSaleInput = document.getElementById('typeOfSale');

    // Forms for each type of sale
    const forms = {
        route: document.getElementById('routeSaleForm'),
        entire: document.getElementById('entireBusinessForm'),
        other: document.getElementById('otherSaleForm'),
    };

    // Dropdown toggle
    dropdownButton.addEventListener('click', function () {
        dropdownOptions.style.display =
            dropdownOptions.style.display === 'block' ? 'none' : 'block';
    });

    // Handle dropdown option selection
    dropdownOptionsList.forEach((option) => {
        option.addEventListener('click', function () {
            const value = this.getAttribute('data-value');
            const text = this.textContent.trim();

            // Update dropdown button text and hidden input value
            dropdownButton.textContent = text;
            typeOfSaleInput.value = value;

            // Hide dropdown options
            dropdownOptions.style.display = 'none';

            // Display the correct form and hide others
            Object.keys(forms).forEach((key) => {
                if (forms[key]) {
                    forms[key].style.display = key === value ? 'block' : 'none';
                }
            });
        });
    });

    // Hide all forms by default
    Object.values(forms).forEach((form) => {
        if (form) form.style.display = 'none';
    });
});


    // Ensure all forms are hidden initially
    Object.values(forms).forEach((form) => {
        if (form) form.style.display = 'none';
    });

    // Handle Excel file imports
    document.querySelectorAll('input[type="file"][id^="excelFile"]').forEach((fileInput) => {
        fileInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const addresses = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                addresses.slice(1).forEach((row) => {
                    const [street, city, state, zip, income] = row;
                    if (street && city && state && zip) {
                        const containerId = getAddressContainerByInputId(fileInput.id);
                        const addressField = createAddressField(street, city, state, zip, income || '');
                        document.getElementById(containerId).appendChild(addressField);
                    }
                });
            };
            reader.readAsArrayBuffer(file);
        });
    });

    // Add address button logic
    document.querySelectorAll('button[id^="addAddressButton"]').forEach((addButton) => {
        addButton.addEventListener('click', function () {
            const containerId = getAddressContainerByInputId(addButton.id);
            const container = document.getElementById(containerId);
            const addressField = createAddressField();
            container.appendChild(addressField);
        });
    });

    // Get the corresponding address container ID based on the input/button ID
    function getAddressContainerByInputId(inputId) {
        if (inputId.includes('excelFile')) {
            if (inputId.includes('Entire')) return 'entireAddressContainer';
            if (inputId.includes('Other')) return 'otherAddressContainer';
            return 'addressContainer';
        }
        if (inputId.includes('addAddressButton')) {
            if (inputId.includes('Entire')) return 'entireAddressContainer';
            if (inputId.includes('Other')) return 'otherAddressContainer';
            return 'addressContainer';
        }
        return null;
    }

    // Create an address field dynamically
    function createAddressField(street = '', city = '', state = '', zip = '', income = '') {
        const addressContainer = document.createElement('div');
        addressContainer.classList.add('address-container');
        addressContainer.innerHTML = `
            <input type="text" name="streetAddress[]" placeholder="Street Address" value="${street}" required>
            <input type="text" name="city[]" placeholder="City" value="${city}" required>
            <input type="text" name="state[]" placeholder="State" value="${state}" required>
            <input type="text" name="zipCode[]" placeholder="Zip Code" value="${zip}" required>
            <input type="number" name="monthlyIncome[]" placeholder="Monthly Income" value="${income}" required>
            <button type="button" class="remove-address-button">Remove</button>
        `;
        addressContainer.querySelector('.remove-address-button').addEventListener('click', function () {
            addressContainer.remove();
        });
        return addressContainer;
    }

    // Handle form submission
    const form = document.getElementById('addBusinessListingForm');
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const saleType = typeOfSaleInput.value;
            if (!saleType) {
                alert('Please select a Type of Sale.');
                return;
            }

            // Collect form data
            const formData = collectFormData(saleType);

            try {
                const response = await fetch('/add-listing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    alert('Business listing added successfully!');
                    form.reset();
                } else {
                    const errorMessage = await response.text();
                    alert(`Error: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error submitting listing:', error);
                alert('An error occurred while submitting your listing.');
            }
        });
    }

    // Collect form data based on sale type
    function collectFormData(saleType) {
        const addresses = [];
        const containerId = getAddressContainerByInputId(`excelFile${capitalize(saleType)}`);
        document.querySelectorAll(`#${containerId} .address-container`).forEach((container) => {
            const street = container.querySelector('input[name="streetAddress[]"]').value;
            const city = container.querySelector('input[name="city[]"]').value;
            const state = container.querySelector('input[name="state[]"]').value;
            const zip = container.querySelector('input[name="zipCode[]"]').value;
            const income = container.querySelector('input[name="monthlyIncome[]"]').value;

            if (street && city && state && zip) {
                addresses.push({ street, city, state, zip, monthlyIncome: income });
            }
        });

        const formData = { typeOfSale: saleType, addresses };

        // Include additional data based on sale type
        if (saleType === 'route') {
            formData.numCustomers = document.getElementById('numCustomers').value;
            formData.monthlyIncome = document.getElementById('monthlyIncome').value;
            formData.salesPrice = document.getElementById('salesPrice').value;
        } else if (saleType === 'entire') {
            formData.numCustomers = document.getElementById('entireNumCustomers').value;
            formData.monthlyIncome = document.getElementById('entireMonthlyIncome').value;
            formData.salesPrice = document.getElementById('entireSalesPrice').value;
        } else if (saleType === 'other') {
            formData.title = document.getElementById('otherTitle').value;
            formData.numCustomers = document.getElementById('otherNumCustomers').value;
            formData.monthlyIncome = document.getElementById('otherMonthlyIncome').value;
            formData.salesPrice = document.getElementById('otherSalesPrice').value;
        }

        return formData;
    }

    // Capitalize the first letter of a string
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});
