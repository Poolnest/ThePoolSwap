document.addEventListener('DOMContentLoaded', function () {
  const addressContainer   = document.getElementById('addressContainer');
  const addAddressButton   = document.getElementById('addAddressButton');
  const excelFileInput     = document.getElementById('excelFile');
  const routeListingForm   = document.getElementById('addRouteListingForm');

  // Helper to read logged-in user's email (for ownership)
  function ownerEmail() {
    try { return JSON.parse(localStorage.getItem('user') || '{}')?.email || ''; }
    catch { return ''; }
  }

  // Add new dynamic address fields
  addAddressButton.addEventListener('click', function () {
    const fields = document.createElement('div');
    fields.classList.add('address-container');
    fields.innerHTML = `
      <input type="text"   name="streetAddress[]"  placeholder="Street Address" required>
      <input type="text"   name="city[]"           placeholder="City"           required>
      <input type="text"   name="state[]"          placeholder="State"          required>
      <input type="text"   name="zipCode[]"        placeholder="Zip Code"       required>
      <input type="number" name="monthlyIncome[]"  placeholder="Monthly Income" required>
      <button type="button" class="remove-address-button">Remove</button>
    `;
    fields.querySelector('.remove-address-button').addEventListener('click', () => fields.remove());
    addressContainer.appendChild(fields);
  });

  // Excel import
  excelFileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      rows.slice(1).forEach(row => {
        const [street, city, state, zip, income] = row;
        if (street && city && state && zip) {
          const fields = document.createElement('div');
          fields.classList.add('address-container');
          fields.innerHTML = `
            <input type="text"   name="streetAddress[]"  value="${street}" placeholder="Street Address" required>
            <input type="text"   name="city[]"           value="${city}"   placeholder="City"           required>
            <input type="text"   name="state[]"          value="${state}"  placeholder="State"          required>
            <input type="text"   name="zipCode[]"        value="${zip}"    placeholder="Zip Code"       required>
            <input type="number" name="monthlyIncome[]"  value="${income || ''}" placeholder="Monthly Income" required>
            <button type="button" class="remove-address-button">Remove</button>
          `;
          fields.querySelector('.remove-address-button').addEventListener('click', () => fields.remove());
          addressContainer.appendChild(fields);
        }
      });
    };
    reader.readAsArrayBuffer(file);
  });

  // Submit
  routeListingForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const addresses = [];
    document.querySelectorAll('.address-container').forEach(container => {
      const street         = container.querySelector('input[name="streetAddress[]"]').value;
      const city           = container.querySelector('input[name="city[]"]').value;
      const state          = container.querySelector('input[name="state[]"]').value;
      const zip            = container.querySelector('input[name="zipCode[]"]').value;
      const monthlyIncome  = container.querySelector('input[name="monthlyIncome[]"]').value;

      if (street && city && state && zip) {
        addresses.push({ street, city, state, zip, monthlyIncome });
      }
    });

    const formData = {
      listingType:  'route',
      routeTitle:   document.getElementById('routeTitle').value,
      monthlyIncome:document.getElementById('monthlyIncome').value,
      askingPrice:  document.getElementById('askingPrice').value,
      addresses
    };

    // Attach owner email for the new ownership flow
    const email = ownerEmail();
    if (email) formData.ownerEmail = email;

    try {
      const response = await fetch('/add-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Route listing successfully saved!');
        routeListingForm.reset();
        addressContainer.innerHTML = '';
      } else {
        const errorMessage = await response.text();
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving route listing:', error);
      alert('An error occurred while saving the route listing.');
    }
  });
});
