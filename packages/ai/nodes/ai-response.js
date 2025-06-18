const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = function (RED) {
    function AiResponseNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.model = config.model || "gemini-2.5-flash";
        this.apiKey = config.apiKey;
        this.systemPrompt = config.systemPrompt || "Eres un asistente útil y amable.";
        this.maxHistory = config.maxHistory || 10;

        const node = this;

        let genAI;
        if (this.apiKey) {
            genAI = new GoogleGenerativeAI(this.apiKey);
        } else {
            node.error("API Key de Gemini no configurada en la propiedad del nodo AI Response.", null);
        }

        node.on('input', async function (msg) {
            if (!genAI || !node.apiKey) {
                node.error("El cliente de GoogleGenerativeAI no está inicializado o la API Key no está configurada. Introduce la API Key en las propiedades del nodo.", msg);
                node.status({ fill: "red", shape: "dot", text: "Error: API Key / Cliente AI no iniciado" });
                return;
            }

            const userInput = String(msg.payload);

            let chatHistory = node.context().get('aiChatHistory') || [];

            chatHistory.push({ "role": "user", "content": userInput });

            if (chatHistory.length > node.maxHistory * 2) {
                chatHistory = chatHistory.slice(chatHistory.length - (node.maxHistory * 2));
            }

            const geminiContents = [];

            if (node.systemPrompt) {
                if (chatHistory.length === 1 && chatHistory[0].role === "user") {
                    geminiContents.push({ role: "user", parts: [{ text: node.systemPrompt + "\n\n" + chatHistory[0].content }] });
                } else if (chatHistory.length > 1 && chatHistory[0].role === "user") {
                    geminiContents.push({ role: "user", parts: [{ text: node.systemPrompt + "\n\n" + chatHistory[0].content }] });
                    for (let i = 1; i < chatHistory.length; i++) {
                        const message = chatHistory[i];
                        const geminiRole = message.role === "assistant" ? "model" : message.role;
                        geminiContents.push({ role: geminiRole, parts: [{ text: message.content }] });
                    }
                } else {
                    geminiContents.push({ role: "user", parts: [{ text: node.systemPrompt }] });
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
                const model = genAI.getGenerativeModel({ model: node.model });

                const result = await model.generateContent({
                    contents: geminiContents,
                    generationConfig: {
                        maxOutputTokens: config.maxTokens || 200,
                        temperature: config.temperature || 0.7,
                        topP: config.topP || 0.9,
                        topK: config.topK || 1
                    }
                });

                const response = result.response;
                if (response && response.text) {
                    const aiResponse = response.text();
                    msg.payload = aiResponse;

                    chatHistory.push({ "role": "assistant", "content": aiResponse });
                    node.context().set('aiChatHistory', chatHistory);

                    node.status({ fill: "green", shape: "dot", text: "Listo" });
                    node.send(msg);
                } else {
                    node.error("Respuesta inesperada del modelo Gemini: " + JSON.stringify(response), msg);
                    node.status({ fill: "red", shape: "dot", text: "Error Respuesta" });
                    msg.payload = "Lo siento, no pude generar una respuesta clara.";
                    node.send(msg);
                }

            } catch (e) {
                node.error(`Error al usar el SDK de Gemini: ${e.message}`, msg);
                node.status({ fill: "red", shape: "dot", text: "Error SDK" });
                msg.payload = "Ha ocurrido un error inesperado al procesar la respuesta.";
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

    RED.nodes.registerType("ai-response", AiResponseNode);
}