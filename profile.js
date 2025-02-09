document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    // Redirect to login if no user is logged in
    if (!user) {
        alert("You need to log in to access your profile.");
        window.location.href = "login.html";
        return;
    }

    // Load Profile Information
    updateProfileUI(user);

    // Load User Listings
    loadUserListings(user.email);

    // Attach Logout Functionality
    document.getElementById("logout-button").addEventListener("click", logoutUser);

    // Attach Edit Profile Functionality
    document.querySelector(".edit-profile-btn").addEventListener("click", () => {
        editProfile(user);
    });
});

// Function to Update Profile UI
function updateProfileUI(user) {
    // Use the placeholder image if the user.picture is missing or invalid
    const profilePicture = user.picture && user.picture !== "https://via.placeholder.com/150" 
        ? user.picture 
        : "https://via.placeholder.com/150";

    document.getElementById("profile-picture").src = profilePicture;
    document.getElementById("profile-name").textContent = user.username;
    document.getElementById("profile-details").textContent = `Email: ${user.email}`;
    document.getElementById("profile-rating").innerHTML = `<strong>${user.rating || "N/A"}</strong> ★`;
    document.getElementById("profile-reviews").textContent = user.reviews || "No reviews yet";
    document.getElementById("profile-joined").textContent = `${user.joined || "Unknown"} Joined`;
}

// Function to Load User Listings
function loadUserListings(userEmail) {
    const API_URL = "https://mokesell-ec88.restdb.io/rest/listing";
    const API_KEY = "679628de0acc0620a20d364d";

    // Fetch listings belonging to the logged-in user
    fetch(`${API_URL}?q={"email":"${userEmail}"}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-apikey": API_KEY
        }
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch listings.");
            return response.json();
        })
        .then(listings => {
            const listingsContainer = document.getElementById("user-listings-container");

            if (listings.length === 0) {
                listingsContainer.innerHTML = "<p>No listings found. Start selling now!</p>";
                return;
            }

            listingsContainer.innerHTML = listings.map(listing => `
                <div class="listing-item">
                    <img src="${listing.image}" alt="${listing.title}" onerror="this.src='https://via.placeholder.com/150';" />
                    <h4>${listing.title}</h4>
                    <p>${listing.condition}</p>
                    <p>Price: $${listing.price}</p>
                    <button onclick="deleteListing('${listing._id}')">Delete</button>
                </div>
            `).join("");
        })
        .catch(error => {
            console.error("Error fetching user listings:", error);
            alert("Failed to load your listings. Please try again later.");
        });
}


// Function to Delete a Listing
function deleteListing(listingId) {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    fetch("db.json")
        .then(response => response.json())
        .then(data => {
            // Filter out the listing to delete
            const updatedListings = data.listing.filter(item => item.id !== listingId);
            data.listing = updatedListings;

            // Update localStorage (since db.json is static)
            localStorage.setItem("db.json", JSON.stringify(data));

            alert("Listing deleted successfully!");
            window.location.reload(); // Reload the profile page to update the listings
        })
        .catch(error => {
            console.error("Error deleting listing:", error);
            alert("Failed to delete listing. Please try again.");
        });
}

// Function to Edit Profile (Popup Form)
function editProfile(user) {
    const newUsername = prompt("Enter new username:", user.username);
    if (newUsername) {
        user.username = newUsername;
        localStorage.setItem("loggedInUser", JSON.stringify(user)); // Update localStorage
        updateProfileUI(user); // Update UI
        alert("Profile updated successfully!");
    }
}

// Function to Logout User
function logoutUser() {
    localStorage.clear(); // Clears localStorage
    alert("You have been logged out.");
    window.location.href = "login.html"; // Redirect to login page
}


