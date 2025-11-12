const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = function (RED) {
    function AiResponseNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.defaultModel = config.model || "gemini-pro";
        this.defaultApiKey = config.apiKey;
        this.defaultSystemPrompt = config.systemPrompt || "You are a helpful and friendly assistant. Respond in English.";
        this.defaultMaxHistory = config.maxHistory || 10;

        const node = this;
        let genAI = null;

        node.on('input', async function (msg) {
            const currentModel = msg.req?.body?.model ?? config.model ?? "gemini-pro";
            const currentApiKey = msg.req?.body?.apiKey ?? config.apiKey;
            const userProvidedSystemPrompt = msg.req?.body?.systemPrompt ?? config.systemPrompt ?? "You are a helpful and friendly assistant. Respond in English.";
            const currentSystemPrompt = "Always respond in English. " + userProvidedSystemPrompt;
            const currentMaxHistory = msg.req?.body?.maxHistory ?? config.maxHistory ?? 10;

            const currentMaxOutputTokens = msg.req?.body?.maxOutputTokens ?? config.maxTokens ?? 200;
            const currentTemperature = msg.req?.body?.temperature ?? config.temperature ?? 0.7;
            const currentTopP = msg.req?.body?.topP ?? config.topP ?? 0.9;
            const currentTopK = msg.req?.body?.topK ?? config.topK ?? 1;

            if (!currentApiKey) {
                node.error("Gemini API Key not configured. Provide the API Key in the node's properties or in msg.req.body.", msg);
                node.status({ fill: "red", shape: "dot", text: "Error: API Key missing" });
                msg.payload = { payload: "Error: Gemini API Key not configured." };
                node.send(msg);
                return;
            }

            genAI = new GoogleGenerativeAI(currentApiKey);

            let chatHistory = node.context().get('aiChatHistory') || [];

            const aiPayloadType = msg.req?.body?.aiPayloadType ?? config.aiPayloadType ?? "request";

            const rawUserInput = msg.req?.body?.userInput ?? config.userInput ?? msg.payload ?? "";
            
            let userInput;
            if (aiPayloadType === "property" && rawUserInput) {
                try {
                    const propertyPath = String(rawUserInput);
                    const pathParts = propertyPath.split('.');
                    let value = msg;
                    
                    for (const part of pathParts) {
                        if (value && typeof value === 'object' && part in value) {
                            value = value[part];
                        } else {
                            value = undefined;
                            break;
                        }
                    }
                    
                    userInput = String(value ?? "");
                } catch (e) {
                    node.warn(`Error accessing property path "${rawUserInput}": ${e.message}`);
                    userInput = String(rawUserInput);
                }
            } else {
                userInput = String(rawUserInput);
            }

            chatHistory.push({ "role": "user", "content": userInput });

            if (chatHistory.length > currentMaxHistory * 2) {
                chatHistory = chatHistory.slice(chatHistory.length - (currentMaxHistory * 2));
            }

            const geminiContents = [];

            if (currentSystemPrompt) {
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

            node.status({ fill: "blue", shape: "dot", text: "Consulting Gemini (SDK)..." });

            try {
                const model = genAI.getGenerativeModel({ model: currentModel });

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

                    node.status({ fill: "green", shape: "dot", text: "Done" });
                    node.send(msg);
                } else {
                    node.error("Unexpected response from Gemini model: " + JSON.stringify(response), msg);
                    node.status({ fill: "red", shape: "dot", text: "Error Response" });
                    msg.payload = { payload: "Sorry, I could not generate a clear response." };
                    node.send(msg);
                }

            } catch (e) {
                node.error(`Error using Gemini SDK: ${e.message}`, msg);
                node.status({ fill: "red", shape: "dot", text: "SDK Error" });
                msg.payload = { payload: `An unexpected error occurred while processing the request: ${e.message}` };
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