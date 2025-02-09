document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://mokesell-0044.restdb.io/rest/listing";
    const API_KEY = "67a89ea999fb60036de983c8";

    setTimeout(() => {
        const searchBar = document.getElementById("searchBar");
        const searchBtn = document.getElementById("search-btn");
        const listingsContainer = document.getElementById("featured-listings-container");

        const conditionButtons = document.querySelectorAll(".condition-btn");
        const clearFilterBtn = document.getElementById("clear-filters");

        let selectedCondition = "";

        if (!searchBar || !searchBtn || !listingsContainer || !clearFilterBtn) {
            console.error("Required elements not found!");
            return;
        }

        // Search Button Click Event
        searchBtn.addEventListener("click", function () {
            const query = searchBar.value.trim().toLowerCase();
            if (!query) {
                alert("Please enter a search term.");
                return;
            }
            fetchListings(query, selectedCondition);
        });

        // Condition Button Click Event
        conditionButtons.forEach((button) => {
            button.addEventListener("click", function () {
                selectedCondition = this.innerText; // Filter based on condition
                highlightSelectedCondition(button);
            });
        });

        // Clear Filters Button Click Event
        clearFilterBtn.addEventListener("click", function () {
            selectedCondition = ""; // Reset condition filter
            conditionButtons.forEach((button) => button.classList.remove("selected")); // Clear selected condition
            fetchListings(searchBar.value.trim().toLowerCase(), ""); // Fetch listings again without condition
        });

        // Initial fetch for featured listings
        fetchFeaturedListings(API_URL, API_KEY);
    }, 500); // Delay by 500ms
});

// Fetch Listings Based on Search Query and Condition
async function fetchListings(query, selectedCondition) {
    const API_URL = "https://mokesell-0044.restdb.io/rest/listing";
    const API_KEY = "67a89ea999fb60036de983c8";

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY,
            },
        });

        const listings = await response.json();

        console.log("Fetched Listings:", listings); // Debugging log

        const filteredListings = listings.filter((item) => {
            const matchesQuery = query
                ? item.title.toLowerCase().includes(query)
                : true;
            const matchesCondition = selectedCondition
                ? item.condition.toLowerCase() === selectedCondition.toLowerCase()
                : true;

            return matchesQuery && matchesCondition;
        });

        console.log("Filtered Listings:", filteredListings); // Debugging log

        displaySearchResults(filteredListings);
    } catch (error) {
        console.error("Error fetching listings:", error);
    }
}

// Display Search Results
function displaySearchResults(listings) {
    const resultsContainer = document.getElementById("search-results-container");
    resultsContainer.innerHTML = ""; // Clear previous results

    if (listings.length === 0) {
        resultsContainer.innerHTML =
            "<p>No items found based on your search and filters.</p>";
        return;
    }

    listings.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("listing");

        // Create a clickable link that redirects to productview.html with the product ID in the URL
        itemElement.innerHTML = `
            <a href="productview.html?id=${item._id}" class="listing-link">
                <img src="${
                    item.image ? item.image : "https://via.placeholder.com/150"
                }"
                     alt="${item.title}"
                     onerror="this.src='https://via.placeholder.com/150';" />
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <span>Price: $${item.price}</span>
                <span>Condition: ${item.condition}</span>
            </a>
        `;

        resultsContainer.appendChild(itemElement);
    });
}

// Highlight selected condition button
function highlightSelectedCondition(selected) {
    const buttons = document.querySelectorAll(".condition-btn");
    buttons.forEach((button) => button.classList.remove("selected")); // Remove previous selections
    selected.classList.add("selected"); // Highlight current selection
}

// Fetch Featured Listings
// Fetch Featured Listings (only those marked as bumped)
// Fetch Featured Listings (only those marked as bumped)
async function fetchFeaturedListings(API_URL, API_KEY) {
    try {
        const response = await fetch(`${API_URL}?q={"bumped":true}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY,
            },
        });

        const listings = await response.json();
        const listingsContainer = document.querySelector("#featured-listings-container");

        if (!listingsContainer) {
            console.error("Error: Listings container not found.");
            return;
        }

        if (!listings || listings.length === 0) {
            listingsContainer.innerHTML = "<p>No featured listings available.</p>";
            return;
        }

        listingsContainer.innerHTML = listings
            .map(
                (listing) => `
            <div class="listing">
                <a href="productview.html?id=${listing._id}" class="listing-link">
                    <img src="${
                        listing.image
                            ? listing.image
                            : "https://via.placeholder.com/150"
                    }"
                         alt="${listing.title}"
                         onerror="this.src='https://via.placeholder.com/150';" />
                    <h3>${listing.title}</h3>
                    <p>${listing.description}</p>
                    <span>Price: $${listing.price}</span>
                    <span>Condition: ${listing.condition}</span>
                </a>
            </div>
        `
            )
            .join("");
    } catch (error) {
        console.error("Error fetching featured listings:", error);
        alert("Failed to load featured listings.");
    }
}
