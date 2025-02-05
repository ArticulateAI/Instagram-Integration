require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { sendMessageToExternalAPI } = require("./apiClient"); // Calls external API
const { sendMessageToUser } = require("./sendMessage"); // Sends Instagram messages

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Webhook Verification
app.get("/webhook", (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token === VERIFY_TOKEN) {
        console.log("Webhook Verified!");
        res.status(200).send(challenge);
    } else {
        res.status(403).send("Forbidden");
    }
});

// Handle Incoming Instagram Messages
app.post("/webhook", async (req, res) => {
    try {
        const body = req.body;
        console.log("Received Webhook:", JSON.stringify(body, null, 2));

        if (body.object === "instagram") {
            body.entry.forEach(entry => {
                if (entry.messaging) {
                    entry.messaging.forEach(async event => {
                        const senderId = event.sender?.id;

                        // 🚨 NEW: Check if it's a "read" event and ignore it
                        if (event.read) {
                            console.log("👀 Ignoring read event (message was seen by user)");
                            return;  // Skip processing "read" events
                        }

                        // 🚨 NEW: Ignore bot messages
                        const isEcho = event.message?.is_echo;
                        if (isEcho) {
                            console.log("🔄 Ignoring bot's own message (is_echo: true)");
                            return;  // Skip processing bot messages
                        }

                        // Extract the message text
                        const messageText = event.message?.text;

                        if (senderId && messageText) {
                            console.log(`📩 New message from ${senderId}: ${messageText}`);

                            // Call the external API with the received message
                            const answer = await sendMessageToExternalAPI(messageText);

                            // Send the response back to the Instagram user
                            await sendMessageToUser(senderId, answer);
                        } else {
                            console.warn("⚠️ Missing sender ID or message text");
                        }
                    });
                }
            });
        } else {
            console.warn("⚠️ Received webhook, but it's not a message event");
        }

        res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
        console.error("❌ Error processing webhook:", error);
        res.sendStatus(500);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
