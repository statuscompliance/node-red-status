const axios = require("axios");

module.exports = function (RED) {
    function TrelloCollectorNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            var key =
                msg.req && msg.req.body && msg.req.body.key !== undefined
                    ? msg.req.body.key
                    : config.key;
            var token =
                msg.req && msg.req.body && msg.req.body.token !== undefined
                    ? msg.req.body.token
                    : config.token;
            var boardId =
                msg.req && msg.req.body && msg.req.body.boardId !== undefined
                    ? msg.req.body.boardId
                    : config.boardId;

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
                var trelloCards = trelloResponses
                    .filter((response) => response && response.data.card) // Filtra los elementos válidos
                    .map((response) => response.data.card) // Mapea a las tarjetas
                    .reduce((uniqueCards, card) => {
                        // Usa reduce para filtrar tarjetas únicas basadas en su ID
                        if (!uniqueCards.some((c) => c.id === card.id)) {
                            uniqueCards.push(card);
                        }
                        return uniqueCards;
                    }, []);

                var githubRepoUrls = trelloCards.map((card) => {
                    // Encuentra el attachment con la URL de GitHub para cada tarjeta
                    var matchingResponse = trelloResponses.find(
                        (response) =>
                            response &&
                            response.data &&
                            response.data.card &&
                            response.data.card.id === card.id &&
                            response.data.attachment &&
                            response.data.attachment.url
                    );

                    // Si se encuentra una URL, devuélvela; de lo contrario, "UNKNOWN"
                    return matchingResponse
                        ? matchingResponse.data.attachment.url
                        : "UNKNOWN";
                });

                msg.githubRepoUrls = githubRepoUrls;
                sendGithubUrls(msg);
            } catch (error) {
                msg.payload =
                    "Error processing Trello response: " + error.message;
                node.error(msg.payload);
                node.send(msg);
            }
        }

        function sendGithubUrls(msg) {
            var input = msg.githubRepoUrls;

            if (Array.isArray(input) && input.length > 0) {
                input.forEach(function (url, index) {
                    var newMsg = { ...msg };
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
