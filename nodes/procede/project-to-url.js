const axios = require("axios");

module.exports = function (RED) {
    function ProjectToURLNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            var cardId = msg.req.body.cardId || config.cardId;
            var apiKey = msg.req.body.apiKey || config.apiKey;
            var trelloToken = msg.req.body.trelloToken || config.trelloToken;
            axios
                .get(
                    `https://api.trello.com/1/cards/${cardId}/attachments?key=${apiKey}&token=${trelloToken}`
                )
                .then((response) => {
                    const attachments = response.data;
                    fetchData(attachments, msg);
                })
                .catch((error) => {
                    node.error(
                        "Error fetching Trello attachments, check if the card exists or if the API key and token are correct."
                    );
                    msg.payload = `Failed to fetch Trello attachments, check if the card exists or if the API key and token are correct. Status code: ${error.response.status}`;
                    node.send(msg);
                });
        });

        function fetchData(attachments, msg) {
            // Pasar msg como parámetro
            if (
                attachments.some((attachment) =>
                    attachment.url.includes("github")
                )
            ) {
                // Usar some para verificar si hay alguna URL de GitHub
                var githubRepoUrl = attachments.find((attachment) =>
                    attachment.url.includes("github")
                ).url; // Encontrar la URL de GitHub
                msg.payload = githubRepoUrl;
                node.send(msg);
            } else {
                node.error(
                    "There is no URL to a GitHub repository in the card"
                );
                msg.payload =
                    "There is no URL to a GitHub repository in the card";
                node.send(msg);
            }
        }
    }
    RED.nodes.registerType("project-to-url", ProjectToURLNode);
};
