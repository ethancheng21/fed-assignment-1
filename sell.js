document.addEventListener("DOMContentLoaded", () => {
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    const selectPhotosButton = document.getElementById("selectPhotosButton");
    const imagePreview = document.getElementById("imagePreview");
    const API_URL = "https://mokesell-0044.restdb.io/rest/listing";
    const API_KEY = "67a89ea999fb60036de983c8";

    // Open file explorer when "Select photos" is clicked
    selectPhotosButton.addEventListener("click", () => {
        fileInput.click();
    });

    // Trigger preview when files are selected
    fileInput.addEventListener("change", (event) => {
        handleFiles(event.target.files);
    });

    // Drag-and-drop functionality
    dropzone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropzone.classList.remove("dragover");
        handleFiles(event.dataTransfer.files);
    });

    // Handle file preview
    function handleFiles(files) {
        imagePreview.innerHTML = ""; // Clear previous previews

        if (files.length > 10) {
            alert("You can upload up to 10 images only.");
            return;
        }

        Array.from(files).forEach((file) => {
            if (!file.type.startsWith("image/")) {
                alert("Only image files are allowed.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement("img");
                img.src = e.target.result;
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    // Add event listener for form submission
    document.getElementById("add-listing-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!user) {
            alert("You must be logged in to sell items.");
            window.location.href = "login.html";
            return;
        }

        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const price = parseFloat(document.getElementById("price").value);
        const condition = document.querySelector('input[name="condition"]:checked')?.value;

        if (!condition) {
            alert("Please select a condition for the item.");
            return;
        }

        const imageFile = document.getElementById("fileInput").files[0];
        let imageUrl = "https://via.placeholder.com/150"; // Default image URL

        if (imageFile) {
            // Convert image to Base64 for RESTDB
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            await new Promise((resolve) => (reader.onload = resolve));
            imageUrl = reader.result;
        }

        // Create the listing object
        const listing = {
            title,
            description,
            price,
            image: imageUrl, // Base64 image
            condition,
            username: user.username,
            email: user.email,
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY
                },
                body: JSON.stringify(listing)
            });

            if (!response.ok) {
                throw new Error("Failed to add listing.");
            }

            alert("Listing successfully added!");
            window.location.href = "profile.html"; // Redirect to profile page after saving
        } catch (error) {
            console.error("Error adding listing:", error);
            alert("Error adding listing. Please try again.");
        }
    });
});
