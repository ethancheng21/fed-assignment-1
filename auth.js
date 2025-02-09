document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const logoutButton = document.getElementById("logout-button");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("db.json");
                if (!response.ok) {
                    throw new Error("Failed to fetch user data.");
                }

                const data = await response.json();
                const users = data.users;

                // Find user by email
                const user = users.find(user => user.email === email);
                if (!user) {
                    alert("User not found. Please check your email or register.");
                    return;
                }

                // Validate password (plaintext check for now; should use bcrypt for security)
                if (user.password !== password) {
                    alert("Incorrect password. Please try again.");
                    return;
                }

                // Store user session in localStorage
                localStorage.setItem("loggedInUser", JSON.stringify(user));

                // Redirect to homepage after successful login
                alert(`Welcome, ${user.username}!`);
                window.location.href = "index.html";
            } catch (error) {
                console.error("Error logging in:", error);
                alert("An error occurred while logging in. Please try again later.");
            }
        });
    }

    // Logout functionality - Clears localStorage and redirects to login
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
        document.getElementById("user-info").textContent = `Logged in as: ${user.username}`;
        document.getElementById("logout-container").style.display = "block"; // Show logout button
    } else {
        document.getElementById("logout-container").style.display = "none"; // Hide logout button
    }
});


