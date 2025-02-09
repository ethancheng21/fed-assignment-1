document.addEventListener("DOMContentLoaded", () => {
    const API_URL_LISTING = "https://mokesell-ec88.restdb.io/rest/listing";
    const API_KEY = "679628de0acc0620a20d364d";

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("You need to log in to access your profile.");
        window.location.href = "login.html";
        return;
    }

    // Set default coins for new users
    if (!loggedInUser.coins) {
        loggedInUser.coins = 100; // Default coin balance
        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    }

    // Display Coin Balance
    updateCoinDisplay();

    // Load User Listings
    loadUserListings(loggedInUser.email);

    // Function to Update Coin Display
    function updateCoinDisplay() {
        document.getElementById("coin-balance").textContent = loggedInUser.coins;
    }

    // Load User Listings
    async function loadUserListings(userEmail) {
        try {
            const response = await fetch(`${API_URL_LISTING}?q={"email":"${userEmail}"}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY,
                },
            });

            const listings = await response.json();
            const listingsContainer = document.getElementById("user-listings-container");

            listingsContainer.innerHTML = ""; // Clear previous listings

            if (listings.length === 0) {
                listingsContainer.innerHTML = "<p>No listings found. Start selling now!</p>";
                return;
            }

            listings.forEach((listing) => {
                const listingElement = document.createElement("div");
                listingElement.classList.add("listing-item");

                listingElement.innerHTML = `
                    <img src="${listing.image || 'https://via.placeholder.com/150'}" alt="${listing.title}" />
                    <h4>${listing.title}</h4>
                    <p>${listing.condition}</p>
                    <p>Price: $${listing.price}</p>
                    <button class="delete-button" onclick="deleteListing('${listing._id}')">Delete</button>
                    <button class="bump-button" onclick="bumpListing('${listing._id}')">Bump (50 Coins)</button>
                `;

                listingsContainer.appendChild(listingElement);
            });
        } catch (error) {
            console.error("Error fetching user listings:", error);
            alert("Failed to load your listings. Please try again later.");
        }
    }

    // Function to Bump a Listing
    async function bumpListing(listingId) {
        if (loggedInUser.coins < 50) {
            alert("You don't have enough coins to bump this listing.");
            return;
        }

        try {
            // Update the listing in RESTDB
            await fetch(`${API_URL_LISTING}/${listingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY,
                },
                body: JSON.stringify({ bumped: true }),
            });

            // Deduct 50 coins from the user
            loggedInUser.coins -= 50;
            localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
            updateCoinDisplay();

            alert("Listing bumped successfully!");
        } catch (error) {
            console.error("Error bumping listing:", error);
            alert("Failed to bump the listing. Please try again.");
        }
    }

    // Function to Delete a Listing
    async function deleteListing(listingId) {
        if (!confirm("Are you sure you want to delete this listing?")) return;

        try {
            await fetch(`${API_URL_LISTING}/${listingId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY,
                },
            });

            alert("Listing deleted successfully!");
            loadUserListings(loggedInUser.email); // Reload listings
        } catch (error) {
            console.error("Error deleting listing:", error);
            alert("Failed to delete the listing. Please try again.");
        }
    }
});
