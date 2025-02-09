document.addEventListener("DOMContentLoaded", () => {
    const API_URL_LISTING = "https://mokesell-ec88.restdb.io/rest/listing";
    const API_KEY = "679628de0acc0620a20d364d";

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("Please log in to access the store.");
        window.location.href = "login.html";
        return;
    }

    const bumpButton = document.getElementById("bump-listing-button");
    const modal = document.getElementById("bump-modal");
    const closeModal = document.getElementById("close-modal");
    const userListingsContainer = document.getElementById("user-listings");

    // Open Modal
    bumpButton.addEventListener("click", async () => {
        modal.style.display = "block";

        try {
            const response = await fetch(`${API_URL_LISTING}?q={"ownerId":"${loggedInUser.id}"}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY,
                },
            });

            const listings = await response.json();
            userListingsContainer.innerHTML = ""; // Clear existing listings

            if (listings.length === 0) {
                userListingsContainer.innerHTML = "<p>You have no listings to bump.</p>";
                return;
            }

            listings.forEach((listing) => {
                const listItem = document.createElement("li");
                listItem.textContent = listing.title;
                const bumpButton = document.createElement("button");
                bumpButton.textContent = "Bump This Listing";
                bumpButton.addEventListener("click", () => bumpListing(listing._id));
                listItem.appendChild(bumpButton);
                userListingsContainer.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching user listings:", error);
        }
    });

    // Close Modal
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Function to Bump Listing
    async function bumpListing(listingId) {
        const userCoins = loggedInUser.coins || 0;

        if (userCoins < 50) {
            alert("You don't have enough coins to bump this listing.");
            return;
        }

        try {
            // Update listing in RESTDB
            await fetch(`${API_URL_LISTING}/${listingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY,
                },
                body: JSON.stringify({ bumped: true }),
            });

            // Deduct coins from user (localStorage for now)
            loggedInUser.coins -= 50;
            localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

            alert("Listing bumped successfully!");
            modal.style.display = "none";
        } catch (error) {
            console.error("Error bumping listing:", error);
            alert("Failed to bump the listing. Please try again.");
        }
    }
});
