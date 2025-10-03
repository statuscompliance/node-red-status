const axios = require("axios");
const { addEvidence } = require('@statuscompliance/commons')

module.exports = function (RED) {
    function ExistsUrlNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", async function (msg) {
            const storeEvidences = config.storeEvidences;
            let urlType = msg.req?.body?.urlType ?? config.urlType;
            let cardId = msg.req?.body?.cardId ?? config.cardId;
            let apiKey = msg.req?.body?.apiKey ?? config.apiKey;
            let trelloToken = msg.req?.body?.trelloToken ?? config.trelloToken;
            let githubToken = msg.req?.body?.githubToken ?? config.githubToken;
            
            msg.payload.result = false;
            msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];

            if (!isValidUrl(msg.payload) || !["body", "config", "payload"].includes(urlType)) {
                await addEvidence(msg, "URL", "Invalid URL Type", false, storeEvidences);
                return node.send(msg);
            }

            try {
                const response = await axios.get(`https://api.trello.com/1/cards/${cardId}/attachments?key=${apiKey}&token=${trelloToken}`);
                await processAttachments(response.data, githubToken, msg, node, storeEvidences);
            } catch (error) {
                node.error("Error fetching Trello attachments:", error);
                await addEvidence(msg, "Trello attachments", "Error fetching Trello attachments", false, storeEvidences);
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

        async function processAttachments(attachments, githubToken, msg, node, storeEvidences) {
            const githubAttachment = attachments.find(att => att.url.includes("github"));
            if (!githubAttachment) {
                node.error("No GitHub repository URL found in the card");
                await addEvidence(msg, "GitHub repository", "No GitHub repository URL found", false, storeEvidences);
                return node.send(msg);
            }

            let match = githubAttachment.url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/[^\/]+)?\/?$/);
            if (!match) {
                node.error("Invalid GitHub repository URL");
                await addEvidence(msg, "GitHub repository", "Invalid GitHub repository URL", false, storeEvidences);
                return node.send(msg);
            }

            let [_, username, repoName] = match;
            try {
                const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}`, {
                    headers: { Authorization: githubToken }
                });
                const result = response.status === 200;
                await addEvidence(msg, "GitHub repository", githubAttachment.url, result, storeEvidences);
                msg.payload.result = result;
            } catch (error) {
                node.error("Error fetching GitHub repository:", error);
                await addEvidence(msg, "GitHub repository", "Error fetching GitHub repository", false, storeEvidences);
            }
            node.send(msg);
        }
    }

    RED.nodes.registerType("exists-url", ExistsUrlNode);
};
