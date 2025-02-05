const axios = require("axios");

async function sendMessageToExternalAPI(messageText, chatId = "aaaab") {
    try {
        console.log("⏳ Waiting for response from external API...");

        const response = await axios.post("http://adaptation.cs.columbia.edu:55220/qa/articulateai/v1alpha1", {
            question: messageText,
            chat_id: chatId,
            history: [],
            parameters: {}
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        // Extract only the "answer" field
        const answer = response.data?.answer || "No response received.";
        
        // Print the extracted answer
        console.log("✅ External API Answer:", answer);

        return answer;
    } catch (error) {
        console.error("❌ Error calling external API:", error.response?.data || error.message);
        return "Error processing the request.";
    }
}

// Export function so it can be used in `server.js`
module.exports = { sendMessageToExternalAPI };
