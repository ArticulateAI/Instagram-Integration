require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { sendMessageToExternalAPI } = require("./apiClient");  // Import function

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
                        const messageText = event.message?.text;

                        if (senderId && messageText) {
                            console.log(`📩 New message from ${senderId}: ${messageText}`);

                            // Call the external API with the received message
                            const answer = await sendMessageToExternalAPI(messageText);

                            // Print the final answer separately
                            console.log("💡 Final Response to Print:", answer);
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