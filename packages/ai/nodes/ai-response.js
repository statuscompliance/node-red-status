const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = function (RED) {
    function AiResponseNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        // --- Store default config values on the node object ---
        this.defaultModel = config.model || "gemini-pro"; // Changed default to gemini-pro for wider availability
        this.defaultApiKey = config.apiKey;
        this.defaultSystemPrompt = config.systemPrompt || "You are a helpful and friendly assistant. Respond in English."; // Changed to English
        this.defaultMaxHistory = config.maxHistory || 10;
        // -----------------------------------------------------

        const node = this;
        let genAI = null;

        node.on('input', async function (msg) {
            // Priority: msg.req.body > node's default config > hardcoded fallback
            const currentModel = msg.req?.body?.model ?? node.defaultModel ?? "gemini-pro"; // Default to gemini-pro
            const currentApiKey = msg.req?.body?.apiKey ?? node.defaultApiKey;
            const userProvidedSystemPrompt = msg.req?.body?.systemPrompt ?? node.defaultSystemPrompt ?? "";
            const currentSystemPrompt = "Always respond in English. " + userProvidedSystemPrompt;
            const currentMaxHistory = msg.req?.body?.maxHistory ?? node.defaultMaxHistory ?? 10;

            // Generation config parameters - also allow msg.req.body overrides
            const currentMaxOutputTokens = msg.req?.body?.maxOutputTokens ?? config.maxTokens ?? 200;
            const currentTemperature = msg.req?.body?.temperature ?? config.temperature ?? 0.7;
            const currentTopP = msg.req?.body?.topP ?? config.topP ?? 0.9;
            const currentTopK = msg.req?.body?.topK ?? config.topK ?? 1;

            if (!currentApiKey) {
                node.error("Gemini API Key not configured. Provide the API Key in the node's properties or in msg.req.body.", msg); // English message
                node.status({ fill: "red", shape: "dot", text: "Error: API Key missing" }); // English status
                msg.payload = { payload: "Error: Gemini API Key not configured." }; // Ensure JSON error payload
                node.send(msg);
                return;
            }

            genAI = new GoogleGenerativeAI(currentApiKey);

            let chatHistory = node.context().get('aiChatHistory') || [];

            const userInput = String(msg.payload);
            chatHistory.push({ "role": "user", "content": userInput });

            if (chatHistory.length > currentMaxHistory * 2) {
                chatHistory = chatHistory.slice(chatHistory.length - (currentMaxHistory * 2));
            }

            const geminiContents = [];

            if (currentSystemPrompt) {
                // Ensure system prompt is handled correctly at the beginning of the conversation
                if (chatHistory.length === 1 && chatHistory[0].role === "user") {
                    geminiContents.push({ role: "user", parts: [{ text: currentSystemPrompt + "\n\n" + chatHistory[0].content }] });
                } else {
                    geminiContents.push({ role: "user", parts: [{ text: currentSystemPrompt }] });
                    chatHistory.forEach(message => {
                        const geminiRole = message.role === "assistant" ? "model" : message.role;
                        geminiContents.push({ role: geminiRole, parts: [{ text: message.content }] });
                    });
                }
            } else {
                chatHistory.forEach(message => {
                    const geminiRole = message.role === "assistant" ? "model" : message.role;
                    geminiContents.push({ role: geminiRole, parts: [{ text: message.content }] });
                });
            }

            node.status({ fill: "blue", shape: "dot", text: "Consulting Gemini (SDK)..." }); // English status

            try {
                const model = genAI.getGenerativeModel({ model: currentModel });

                // Add node.warn for debugging geminiContents
                node.warn(`AI Node: Sending contents to Gemini: ${JSON.stringify(geminiContents)}`);

                const result = await model.generateContent({
                    contents: geminiContents,
                    generationConfig: {
                        maxOutputTokens: currentMaxOutputTokens,
                        temperature: currentTemperature,
                        topP: currentTopP,
                        topK: currentTopK
                    }
                });

                const response = result.response;
                if (response && response.text) {
                    const aiResponse = response.text();
                    msg.payload = { payload: aiResponse };

                    chatHistory.push({ "role": "assistant", "content": aiResponse });
                    node.context().set('aiChatHistory', chatHistory);

                    node.status({ fill: "green", shape: "dot", text: "Done" }); // English status
                    node.send(msg);
                } else {
                    node.error("Unexpected response from Gemini model: " + JSON.stringify(response), msg); // English message
                    node.status({ fill: "red", shape: "dot", text: "Error Response" }); // English status
                    msg.payload = { payload: "Sorry, I could not generate a clear response." }; // English error payload
                    node.send(msg);
                }

            } catch (e) {
                node.error(`Error using Gemini SDK: ${e.message}`, msg); // English message
                node.status({ fill: "red", shape: "dot", text: "SDK Error" }); // English status
                msg.payload = { payload: `An unexpected error occurred while processing the request: ${e.message}` }; // English error payload
                node.send(msg);
            }
        });

        node.on('close', function (removed, done) {
            if (removed) {
                node.context().set('aiChatHistory', []);
            }
            done();
        });
    }
    RED.nodes.registerType("ai-response", AiResponseNode, {});
}