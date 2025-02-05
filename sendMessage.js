const axios = require("axios");
require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;  // Add Instagram Account ID

// Function to send a message back to the user
async function sendMessageToUser(userId, messageText) {
    try {
        const url = `https://graph.instagram.com/v22.0/${INSTAGRAM_ACCOUNT_ID}/messages`;

        const response = await axios.post(
            url,
            {
                recipient: { id: userId },
                message: { text: messageText }
            },
            {
                headers: {
                    "Authorization": `Bearer ${PAGE_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(`✅ Message sent to user ${userId}: ${messageText}`);
    } catch (error) {
        console.error("❌ Error sending message:", error.response?.data || error.message);
    }
}

// Export function so it can be used in `server.js`
module.exports = { sendMessageToUser };
