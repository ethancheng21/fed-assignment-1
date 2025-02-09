document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "https://mokesell-0044.restdb.io/rest/listing";
    const API_KEY = "67a89ea999fb60036de983c8";

    // Get product ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        alert("Invalid product. Redirecting to home.");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch product details");

        const product = await response.json();
        displayProductDetails(product);
    } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Failed to load product details.");
    }
});

// Display Product Details
function displayProductDetails(product) {
    const titleElement = document.getElementById("product-title");
    const descriptionElement = document.getElementById("product-description");
    const priceElement = document.getElementById("product-price");
    const conditionElement = document.getElementById("product-condition");
    const imageElement = document.getElementById("product-image");
    const chatButton = document.getElementById("chat-button");

    if (!titleElement || !descriptionElement || !priceElement || !conditionElement || !imageElement) {
        console.error("Missing product details elements.");
        return;
    }

    // Populate product details
    titleElement.textContent = product.title || "No title available";
    descriptionElement.textContent = product.description || "No description available";
    priceElement.textContent = `$${product.price || "0.00"}`;
    conditionElement.textContent = `Condition: ${product.condition || "Unknown"}`;
    imageElement.src = product.image || "https://via.placeholder.com/150";
    imageElement.alt = product.title || "No image available";

    // Set up chat button to start a chat with the seller
    chatButton.addEventListener("click", () => {
        if (!product.ownerId) {
            alert("Seller information is missing.");
            return;
        }
        // Redirect to chat.html with listingId and sellerId
        window.location.href = `chat.html?listingId=${product._id}&receiverId=${product.ownerId}`;
    });
}
