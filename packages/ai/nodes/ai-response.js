const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = function (RED) {
    function AiResponseNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        // --- ADDED: Store default config values on the node object ---
        this.defaultModel = config.model || "gemini-2.5-flash";
        this.defaultApiKey = config.apiKey; // This will be whatever is set in the node's properties
        this.defaultSystemPrompt = config.systemPrompt || "Eres un asistente útil y amable.";
        this.defaultMaxHistory = config.maxHistory || 10;
        // -------------------------------------------------------------

        const node = this;
        let genAI = null; // genAI will be initialized per-input

        node.on('input', async function (msg) {
            // Priority: msg.req.body > node's default config > hardcoded fallback
            const currentModel = msg.req?.body?.model ?? node.defaultModel ?? "gemini-2.5-flash";
            const currentApiKey = msg.req?.body?.apiKey ?? node.defaultApiKey; // Must come from config or msg.req.body
            const currentSystemPrompt = msg.req?.body?.systemPrompt ?? node.defaultSystemPrompt ?? "Eres un asistente útil y amable.";
            const currentMaxHistory = msg.req?.body?.maxHistory ?? node.defaultMaxHistory ?? 10;

            // Generation config parameters - also allow msg.req.body overrides
            const currentMaxOutputTokens = msg.req?.body?.maxOutputTokens ?? config.maxTokens ?? 200;
            const currentTemperature = msg.req?.body?.temperature ?? config.temperature ?? 0.7;
            const currentTopP = msg.req?.body?.topP ?? config.topP ?? 0.9;
            const currentTopK = msg.req?.body?.topK ?? config.topK ?? 1;

            if (!currentApiKey) {
                node.error("API Key de Gemini no configurada. Introduce la API Key en las propiedades del nodo o en msg.req.body.", msg);
                node.status({ fill: "red", shape: "dot", text: "Error: API Key faltante" });
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
                // This logic might need further refinement depending on desired chat session restart/continuation
                if (chatHistory.length === 1 && chatHistory[0].role === "user") {
                    // If it's the very first user message, prepend system prompt to it
                    geminiContents.push({ role: "user", parts: [{ text: currentSystemPrompt + "\n\n" + chatHistory[0].content }] });
                } else {
                    // For subsequent messages, add the system prompt as a user message at the very beginning
                    // (This ensures it's always included if specified, even if not part of the `chatHistory` array itself)
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

            node.status({ fill: "blue", shape: "dot", text: "Consultando Gemini (SDK)..." });

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
                    msg.payload = { payload: aiResponse };;

                    chatHistory.push({ "role": "assistant", "content": aiResponse });
                    node.context().set('aiChatHistory', chatHistory);

                    node.status({ fill: "green", shape: "dot", text: "Listo" });
                    node.send(msg);
                } else {
                    node.error("Respuesta inesperada del modelo Gemini: " + JSON.stringify(response), msg);
                    node.status({ fill: "red", shape: "dot", text: "Error Respuesta" });
                    msg.payload = { payload: "Lo siento, no pude generar una respuesta clara." };
                    node.send(msg);
                }

            } catch (e) {
                node.error(`Error al usar el SDK de Gemini: ${e.message}`, msg);
                node.status({ fill: "red", shape: "dot", text: "Error SDK" });
                msg.payload = {payload: "Ha ocurrido un error inesperado al procesar la respuesta."};
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