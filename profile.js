document.addEventListener("DOMContentLoaded", async () => {
    const API_URL_LISTING = "https://mokesell-0044.restdb.io/rest/listing";
    const API_URL_USER = "https://mokesell-0044.restdb.io/rest/userss"; // Correct endpoint
    const API_KEY = "67a89ea999fb60036de983c8";

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("You need to log in to access your profile.");
        window.location.href = "login.html";
        return;
    }

    // Fetch user details from RestDB
    const userData = await fetchUserDetails(loggedInUser.email);

    if (userData) {
        // Dynamically update profile details
        document.getElementById("profile-name").textContent = userData.username || "Unknown User";
        document.getElementById("profile-details").textContent = `Email: ${userData.email || "No Email"}`;
        document.getElementById("profile-picture").src = userData.picture || "default-profile.png";
        document.getElementById("profile-rating").innerHTML = `<strong>${userData.rating || "N/A"}</strong> ★`;
        document.getElementById("profile-reviews").textContent = `${userData.reviews || "0"} reviews`;
        document.getElementById("profile-joined").textContent = `Joined: ${formatDate(userData.joined) || "N/A"}`;
        document.getElementById("coin-balance").textContent = userData.coins || 0;
    } else {
        alert("Failed to load user details. Please try again.");
    }

    // Load User Listings
    await loadUserListings(loggedInUser.email);

    /*** Function to Fetch User Details ***/
    async function fetchUserDetails(email) {
        try {
            const response = await fetch(`${API_URL_USER}?q={"email":"${email}"}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY,
                },
            });

            const users = await response.json();
            return users[0]; // Assuming the first match is the correct user
        } catch (error) {
            console.error("Error fetching user details:", error);
            return null;
        }
    }

    /*** Function to Format Date ***/
    function formatDate(dateString) {
        if (!dateString) return null;
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    /*** Function to Load User Listings ***/
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
                    <button class="bump-button" onclick="bumpListing('${listing._id}')">Bump Listing</button>
                `;
            
                listingsContainer.appendChild(listingElement);
            });            
        } catch (error) {
            console.error("Error fetching user listings:", error);
            alert("Failed to load your listings. Please try again later.");
        }
    }
});

// Make bumpListing globally accessible
async function bumpListing(listingId) {
    const API_URL_LISTING = "https://mokesell-0044.restdb.io/rest/listing";
    const API_KEY = "67a89ea999fb60036de983c8";

    try {
        // Fetch the existing record
        const fetchResponse = await fetch(`${API_URL_LISTING}/${listingId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY,
            },
        });

        if (!fetchResponse.ok) {
            throw new Error(`Failed to fetch the listing: ${fetchResponse.statusText}`);
        }

        const existingRecord = await fetchResponse.json();

        // Update the "bumped" field to true
        existingRecord.bumped = true;

        // Send the updated record back to RestDB
        const updateResponse = await fetch(`${API_URL_LISTING}/${listingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY,
            },
            body: JSON.stringify(existingRecord),
        });

        const result = await updateResponse.json();
        console.log("Bump Listing Response:", result);

        if (updateResponse.ok) {
            alert("Listing successfully bumped!");
        } else {
            throw new Error(`Failed to bump listing: ${result.message}`);
        }
    } catch (error) {
        console.error("Error bumping listing:", error);
        alert("Failed to bump the listing. Please try again.");
    }
}


// Make deleteListing globally accessible
async function deleteListing(listingId) {
    const API_URL_LISTING = "https://mokesell-0044.restdb.io/rest/listing";
    const API_KEY = "67a89ea999fb60036de983c8";
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

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
