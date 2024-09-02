const axios = require("axios");

module.exports = function (RED) {
    function TrelloCollectorNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            var boardId = msg.req.body.boardId || config.boardId;
            var key = msg.req.body.key || config.key;
            var token = msg.req.body.token || config.token;

            axios
                .get(
                    `https://api.trello.com/1/boards/${boardId}/actions?key=${key}&token=${token}`
                )
                .then((response) => {
                    const trelloResponses = response.data;
                    processData(trelloResponses, msg);
                })
                .catch((error) => {
                    node.error(
                        "Error fetching Trello data. Please check your boardId, key, and token."
                    );
                    msg.payload = `Failed to fetch Trello data. Status code: ${error.response.status}`;
                    node.send(msg);
                });
        });

        function processData(trelloResponses, msg) {
            try {
                var githubRepoUrls = trelloResponses
                    .filter(
                        (response) =>
                            response &&
                            response.data &&
                            response.data.attachment &&
                            response.data.attachment.url
                    )
                    .map((response) => response.data.attachment.url);

                msg.payload = githubRepoUrls;
            } catch (error) {
                msg.payload =
                    "Error processing Trello response: " + error.message;
            }

            msg.githubRepoUrls = msg.payload;
            sendGithubUrls(msg);
        }

        function sendGithubUrls(msg) {
            var input = msg.githubRepoUrls;

            if (Array.isArray(input) && input.length > 0) {
                input.forEach(function (url, index) {
                    var newMsg = {};
                    newMsg.payload = url;
                    node.send(newMsg);
                });
            } else {
                node.error("Input is not a valid array of URLs", msg);
            }
        }
    }
    RED.nodes.registerType("trello-collector", TrelloCollectorNode);
};
