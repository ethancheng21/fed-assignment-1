const API_URL = "http://localhost:5000"; // Update if necessary

// Optional: Get logged-in user (null if not logged in)
const loggedInUser = JSON.parse(localStorage.getItem("user"));

// Log a warning if the user is not logged in, but continue to allow access
if (!loggedInUser) {
    console.warn("No logged-in user. Some features may not work.");
}

let selectedChatUser = null; // Track the selected chat user

// Load the list of chats
async function loadChatList() {
    try {
        // If no user is logged in, skip loading personal chats
        if (!loggedInUser) {
            const chatListContainer = document.querySelector(".chat-list");
            chatListContainer.innerHTML = "<p>Please log in to view your chats.</p>";
            return;
        }

        const response = await fetch(`${API_URL}/users/${loggedInUser.id}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        const chatListContainer = document.querySelector(".chat-list");
        chatListContainer.innerHTML = ""; // Clear previous chat list

        if (!userData.chats || Object.keys(userData.chats).length === 0) {
            chatListContainer.innerHTML = "<p>No chats available.</p>";
            return;
        }

        Object.keys(userData.chats).forEach((contact) => {
            const chatItem = document.createElement("li");
            chatItem.className = "chat-item";
            chatItem.setAttribute("data-contact", contact); // Store contact info
            chatItem.innerHTML = `
                <div class="chat-avatar"></div>
                <div class="chat-info">
                    <strong>${contact}</strong>
                    <p>${userData.chats[contact].slice(-1)[0]?.message || "No messages yet"}</p>
                </div>
            `;

            // Add click event to load messages for the selected chat
            chatItem.addEventListener("click", () => {
                console.log("Selected contact:", contact); // Debugging log
                loadMessages(contact);
            });

            chatListContainer.appendChild(chatItem);
        });
    } catch (error) {
        console.error("Error loading chat list:", error.message);
    }
}

// Load messages for a specific chat
async function loadMessages(contactUsername) {
    selectedChatUser = contactUsername;

    // Highlight the selected chat in the sidebar
    document.querySelectorAll(".chat-item").forEach((item) => {
        item.classList.remove("active");
    });

    const selectedChatItem = document.querySelector(`.chat-item[data-contact="${contactUsername}"]`);
    if (selectedChatItem) {
        selectedChatItem.classList.add("active");
    }

    document.getElementById("chat-title").textContent = `Chat with ${contactUsername}`; // Update chat header

    try {
        const response = await fetch(`${API_URL}/users/${loggedInUser?.id || "public"}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        const chatContainer = document.querySelector(".messages");

        chatContainer.innerHTML = ""; // Clear previous messages

        const messages = userData.chats[contactUsername] || [];
        messages.forEach((message) => {
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            messageElement.classList.add(
                message.sender === loggedInUser?.username ? "user-message" : "system-message"
            );
            messageElement.textContent = message.message;
            chatContainer.appendChild(messageElement);
        });

        // Scroll to latest message
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (error) {
        console.error("Error loading messages:", error.message);
    }
}

// Send a new message
async function sendMessage(event) {
    event.preventDefault();

    const messageInput = document.querySelector(".message-input");
    const messageText = messageInput.value.trim();

    if (!messageText) {
        alert("Message cannot be empty.");
        return;
    }

    // Check if the user is logged in before sending a message
    if (!loggedInUser) {
        alert("Please log in to send a message.");
        return;
    }

    const message = {
        sender: loggedInUser.username,
        receiver: selectedChatUser,
        message: messageText,
        timestamp: new Date().toISOString(),
    };

    try {
        const response = await fetch(`${API_URL}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });

        if (!response.ok) throw new Error("Failed to send message.");

        // Reload chat messages
        loadMessages(selectedChatUser);
        messageInput.value = ""; // Clear the input field
    } catch (error) {
        console.error("Error sending message:", error.message);
        alert("Failed to send the message.");
    }
}

// Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
    loadChatList();

    const chatInputForm = document.querySelector(".message-form");
    if (chatInputForm) {
        chatInputForm.addEventListener("submit", sendMessage);
    }
});
