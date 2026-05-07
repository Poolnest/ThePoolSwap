document.addEventListener('DOMContentLoaded', function () {
    const dropdownButton      = document.getElementById('dropdownButton');
    const dropdownOptions     = document.getElementById('dropdownOptions');
    const dropdownOptionsList = document.querySelectorAll('.dropdown-option');
    const typeOfSaleInput     = document.getElementById('typeOfSale');

    const forms = {
        route:  document.getElementById('routeSaleForm'),
        entire: document.getElementById('entireBusinessForm'),
        other:  document.getElementById('otherSaleForm'),
    };

    // Hide all sub-forms initially
    Object.values(forms).forEach(f => { if (f) f.style.display = 'none'; });

    // Dropdown toggle
    dropdownButton.addEventListener('click', function () {
        dropdownOptions.style.display =
            dropdownOptions.style.display === 'block' ? 'none' : 'block';
    });

    // Dropdown option selection
    dropdownOptionsList.forEach(option => {
        option.addEventListener('click', function () {
            const value = this.getAttribute('data-value');
            dropdownButton.textContent = this.querySelector('.description')
                ? this.childNodes[0].textContent.trim()
                : this.textContent.trim();
            typeOfSaleInput.value = value;
            dropdownOptions.style.display = 'none';

            Object.keys(forms).forEach(key => {
                if (forms[key]) forms[key].style.display = (key === value) ? 'block' : 'none';
            });
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('#customDropdown')) {
            dropdownOptions.style.display = 'none';
        }
    });

    // ── Excel file import ──────────────────────────────────────────────────
    document.querySelectorAll('input[type="file"][id^="excelFile"]').forEach(fileInput => {
        fileInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                const data      = new Uint8Array(e.target.result);
                const workbook  = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows      = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                const containerId = getContainerIdByInputId(fileInput.id);
                rows.slice(1).forEach(row => {
                    const [street, city, state, zip, income] = row;
                    if (street && city && state && zip) {
                        const field = createAddressField(street, city, state, zip, income || '');
                        document.getElementById(containerId).appendChild(field);
                    }
                });
            };
            reader.readAsArrayBuffer(file);
        });
    });

    // ── Add address buttons ────────────────────────────────────────────────
    document.querySelectorAll('button[id^="addAddressButton"]').forEach(btn => {
        btn.addEventListener('click', function () {
            const containerId = getContainerIdByInputId(btn.id);
            document.getElementById(containerId).appendChild(createAddressField());
        });
    });

    function getContainerIdByInputId(id) {
        if (id.includes('Entire') || id.includes('entire')) return 'entireAddressContainer';
        if (id.includes('Other')  || id.includes('other'))  return 'otherAddressContainer';
        return 'addressContainer';
    }

    function createAddressField(street = '', city = '', state = '', zip = '', income = '') {
        const div = document.createElement('div');
        div.classList.add('address-container');
        div.innerHTML = `
            <input type="text"   name="streetAddress[]"  placeholder="Street Address" value="${street}" required>
            <input type="text"   name="city[]"           placeholder="City"           value="${city}"   required>
            <input type="text"   name="state[]"          placeholder="State"          value="${state}"  required>
            <input type="text"   name="zipCode[]"        placeholder="Zip Code"       value="${zip}"    required>
            <input type="number" name="monthlyIncome[]"  placeholder="Monthly Income" value="${income}" required>
            <button type="button" class="remove-address-button">Remove</button>
        `;
        div.querySelector('.remove-address-button').addEventListener('click', () => div.remove());
        return div;
    }

    // ── Form submission ────────────────────────────────────────────────────
    const form = document.getElementById('addBusinessListingForm');
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const saleType = typeOfSaleInput.value;
            if (!saleType) {
                alert('Please select a Type of Sale.');
                return;
            }

            const formData = collectFormData(saleType);

            try {
                const response = await fetch('/add-listing', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(formData),
                });

                if (response.ok) {
                    alert('Business listing added successfully!');
                    form.reset();
                    Object.values(forms).forEach(f => { if (f) f.style.display = 'none'; });
                    dropdownButton.textContent = 'Select Type of Sale';
                    typeOfSaleInput.value = '';
                } else {
                    const msg = await response.text();
                    alert(`Error: ${msg}`);
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('An error occurred while submitting your listing.');
            }
        });
    }

    function collectFormData(saleType) {
        const containerId = getContainerIdByInputId(`excelFile${capitalize(saleType)}`);
        const addresses   = [];

        document.querySelectorAll(`#${containerId} .address-container`).forEach(container => {
            const street = container.querySelector('input[name="streetAddress[]"]')?.value;
            const city   = container.querySelector('input[name="city[]"]')?.value;
            const state  = container.querySelector('input[name="state[]"]')?.value;
            const zip    = container.querySelector('input[name="zipCode[]"]')?.value;
            const income = container.querySelector('input[name="monthlyIncome[]"]')?.value;
            if (street && city && state && zip) {
                addresses.push({ street, city, state, zip, monthlyIncome: income });
            }
        });

        const data = { listingType: 'business', typeOfSale: saleType, addresses };

        if (saleType === 'route') {
            data.numCustomers  = document.getElementById('numCustomers')?.value;
            data.monthlyIncome = document.getElementById('monthlyIncome')?.value;
            data.salesPrice    = document.getElementById('salesPrice')?.value;
        } else if (saleType === 'entire') {
            data.numCustomers  = document.getElementById('entireNumCustomers')?.value;
            data.monthlyIncome = document.getElementById('entireMonthlyIncome')?.value;
            data.salesPrice    = document.getElementById('entireSalesPrice')?.value;
        } else if (saleType === 'other') {
            data.title         = document.getElementById('otherTitle')?.value;
            data.numCustomers  = document.getElementById('otherNumCustomers')?.value;
            data.monthlyIncome = document.getElementById('otherMonthlyIncome')?.value;
            data.salesPrice    = document.getElementById('otherSalesPrice')?.value;
        }

        return data;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});