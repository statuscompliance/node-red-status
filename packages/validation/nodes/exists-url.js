const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

module.exports = function (RED) {
    function ExistsUrlNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", async function (msg) {
            let urlType = msg.req?.body?.urlType ?? config.urlType;
            let cardId = msg.req?.body?.cardId ?? config.cardId;
            let apiKey = msg.req?.body?.apiKey ?? config.apiKey;
            let trelloToken = msg.req?.body?.trelloToken ?? config.trelloToken;
            let githubToken = msg.req?.body?.githubToken ?? config.githubToken;
            
            msg.payload.result = false;
            msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];

            if (!isValidUrl(msg.payload) || !["body", "config", "payload"].includes(urlType)) {
                addEvidence(msg, "URL", "Invalid URL Type", false);
                return node.send(msg);
            }

            try {
                const response = await axios.get(`https://api.trello.com/1/cards/${cardId}/attachments?key=${apiKey}&token=${trelloToken}`);
                await processAttachments(response.data, githubToken, msg, node);
            } catch (error) {
                node.error("Error fetching Trello attachments:", error);
                addEvidence(msg, "Trello attachments", "Error fetching Trello attachments", false);
                node.send(msg);
            }
        });
    
        function isValidUrl(url) {
            try {
                new URL(url);
                return true;
            } catch (error) {
                return false;
            }
        }

        async function processAttachments(attachments, githubToken, msg, node) {
            const githubAttachment = attachments.find(att => att.url.includes("github"));
            if (!githubAttachment) {
                node.error("No GitHub repository URL found in the card");
                addEvidence(msg, "GitHub repository", "No GitHub repository URL found", false);
                return node.send(msg);
            }

            let match = githubAttachment.url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/[^\/]+)?\/?$/);
            if (!match) {
                node.error("Invalid GitHub repository URL");
                addEvidence(msg, "GitHub repository", "Invalid GitHub repository URL", false);
                return node.send(msg);
            }

            let [_, username, repoName] = match;
            try {
                const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}`, {
                    headers: { Authorization: githubToken }
                });
                const result = response.status === 200;
                addEvidence(msg, "GitHub repository", githubAttachment.url, result);
                msg.payload.result = result;
            } catch (error) {
                node.error("Error fetching GitHub repository:", error);
                addEvidence(msg, "GitHub repository", "Error fetching GitHub repository", false);
            }
            node.send(msg);
        }

        function addEvidence(msg, key, value, result) {
            msg.payload.evidences.push({
                id: uuidv4(),
                key,
                value,
                result
            });
        }
    }

    RED.nodes.registerType("exists-url", ExistsUrlNode);
};
