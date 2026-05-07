let map;
let listings = []; // Assume this will be populated with your listings data

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 34.0522, lng: -118.2437 }, // Example coordinates (Los Angeles)
    });

    // Sample data for listings
    listings = [
        { title: "Pool 1", address: "123 Pool St, Los Angeles, CA", location: { lat: 34.0522, lng: -118.2437 }, price: 20000, type: "Individual" },
        { title: "Route 1", address: "456 Route Rd, Los Angeles, CA", location: { lat: 34.0525, lng: -118.2430 }, price: 30000, type: "Route" },
        // Add more listings as needed
    ];

    listings.forEach(listing => {
        const marker = new google.maps.Marker({
            position: getRandomOffset(listing.location),
            map: map,
            title: listing.title,
        });

        // Add click listener to open info window
        const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${listing.title}</strong><br>${listing.address}<br>$${listing.price}<br>${listing.type}</div>`
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });

    // Populate listings sidebar
    populateListings();
}

// Function to get a random offset for a given location
function getRandomOffset(location) {
    const radiusInMiles = 0.25; // 1/4 mile
    const latOffset = (Math.random() * radiusInMiles) / 69; // 1 degree latitude ~ 69 miles
    const lngOffset = (Math.random() * radiusInMiles) / (69 * Math.cos(location.lat * (Math.PI / 180))); // Adjust for longitude

    return {
        lat: location.lat + (Math.random() < 0.5 ? -latOffset : latOffset),
        lng: location.lng + (Math.random() < 0.5 ? -lngOffset : lngOffset),
    };
}

// Function to populate listings in the sidebar
function populateListings() {
    const listingsDiv = document.getElementById('listings');
    listingsDiv.innerHTML = ''; // Clear previous listings

    listings.forEach(listing => {
        const listingDiv = document.createElement('div');
        listingDiv.className = 'listing-item';
        listingDiv.innerHTML = `<h3>${listing.title}</h3><p>${listing.address}</p><p>$${listing.price}</p><p>${listing.type}</p>`;
        listingsDiv.appendChild(listingDiv);
    });
}

// Filter functionality
document.getElementById('filterButton').addEventListener('click', () => {
    const filterCity = document.getElementById('filterCity').value.toLowerCase();
    const filterState = document.getElementById('filterState').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const listingType = document.getElementById('listingType').value;

    const filteredListings = listings.filter(listing => {
        const matchesCity = listing.address.toLowerCase().includes(filterCity);
        const matchesState = listing.address.toLowerCase().includes(filterState);
        const matchesPrice = listing.price >= minPrice && listing.price <= maxPrice;
        const matchesType = listingType ? listing.type === listingType : true;

        return matchesCity && matchesState && matchesPrice && matchesType;
    });

    // Update listings in sidebar
    const listingsDiv = document.getElementById('listings');
    listingsDiv.innerHTML = ''; // Clear previous listings
    filteredListings.forEach(listing => {
        const listingDiv = document.createElement('div');
        listingDiv.className = 'listing-item';
        listingDiv.innerHTML = `<h3>${listing.title}</h3><p>${listing.address}</p><p>$${listing.price}</p><p>${listing.type}</p>`;
        listingsDiv.appendChild(listingDiv);
    });
});

// Call initMap to set up the map
window.initMap = initMap;
