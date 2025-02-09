document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const logoutButton = document.getElementById("logout-button");
    const API_URL = "https://mokesell-0044.restdb.io/rest/userss";
    const API_KEY = "67a89ea999fb60036de983c8";

    // Function to generate a UUID
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    // Registration Functionality
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const userData = {
                id: generateUUID(), // Generate a unique ID for the user
                username,
                email,
                password,
                picture: "https://via.placeholder.com/150", // Default profile picture
                rating: "N/A",
                reviews: "No reviews yet",
                joined: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
                coins: 100 // Default coins for a new user
            };

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-apikey": API_KEY
                    },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to register user.");
                }

                alert("Account created successfully! You can now log in.");
                window.location.href = "login.html"; // Redirect to login page
            } catch (error) {
                console.error("Error registering user:", error);
                alert("An error occurred while creating your account. Please try again.");
            }
        });
    }

    // Login Functionality
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch(API_URL, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "x-apikey": API_KEY
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user data.");
                }

                const users = await response.json();
                const user = users.find(user => user.email === email);

                if (!user) {
                    alert("User not found. Please check your email or register.");
                    return;
                }

                if (user.password !== password) {
                    alert("Incorrect password. Please try again.");
                    return;
                }

                // Store user session in localStorage
                localStorage.setItem("loggedInUser", JSON.stringify(user));

                alert(`Welcome, ${user.username}!`);
                window.location.href = "index.html"; // Redirect to homepage after login
            } catch (error) {
                console.error("Error logging in:", error);
                alert("An error occurred while logging in. Please try again later.");
            }
        });
    }

    // Logout Functionality
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.clear(); // Clears all stored user data
            alert("You have been logged out.");
            window.location.href = "login.html"; // Redirect to login page
        });
    }

    // Check if user is logged in and update UI
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user) {
        const userInfoElement = document.getElementById("user-info");
        const logoutContainer = document.getElementById("logout-container");

        if (userInfoElement) {
            userInfoElement.textContent = `Logged in as: ${user.username}`;
        }

        if (logoutContainer) {
            logoutContainer.style.display = "block"; // Show logout button
        }
    } else {
        const logoutContainer = document.getElementById("logout-container");
        if (logoutContainer) {
            logoutContainer.style.display = "none"; // Hide logout button
        }
    }
});
