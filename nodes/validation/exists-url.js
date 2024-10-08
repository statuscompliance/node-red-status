const axios = require("axios");

module.exports = function (RED) {
    function ExistsUrlNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            var urlType =
                msg.req && msg.req.body && msg.req.body.urlType !== undefined
                    ? msg.req.body.urlType
                    : config.urlType;
            var cardId =
                msg.req && msg.req.body && msg.req.body.cardId !== undefined
                    ? msg.req.body.cardId
                    : config.cardId;
            var apiKey =
                msg.req && msg.req.body && msg.req.body.apiKey !== undefined
                    ? msg.req.body.apiKey
                    : config.apiKey;
            var trelloToken =
                msg.req &&
                msg.req.body &&
                msg.req.body.trelloToken !== undefined
                    ? msg.req.body.trelloToken
                    : config.trelloToken;
            var githubToken =
                msg.req && msg.req.body && msg.req.body.eventAName !== undefined
                    ? msg.req.body.eventAName
                    : config.eventAName;
            if (
                (urlType === "body" ||
                    urlType === "config" ||
                    urlType === "payload") &&
                isUrl(msg.payload)
            ) {
                axios
                    .get(
                        `https://api.trello.com/1/cards/${cardId}/attachments?key=${apiKey}&token=${trelloToken}`
                    )
                    .then((response) => {
                        const attachments = response.data;
                        existsData(attachments, githubToken, msg); // Pasar msg como argumento
                    })
                    .catch((error) => {
                        node.error("Error fetching Trello attachments:", error);
                        msg.payload =
                            ("Error fetching Trello attachments:", error);
                        node.send(msg);
                    });
            } else {
                msg.payload = { result: false };
                node.send(msg);
            }
        });

        function isUrl(url) {
            try {
                new URL(url);
                return true;
            } catch (error) {
                return false;
            }
        }

        function existsData(attachments, githubToken, msg) {
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
                var regex =
                    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?(tree\/[^\/]+)?\/?$/;
                var match = githubRepoUrl.match(regex);
                if (match) {
                    // Verificar si hay un partido antes de acceder a match[1] y match[2]
                    var username = match[1];
                    var repoName = match[2];

                    var headers = {};
                    headers["Authorization"] = githubToken;
                    axios
                        .get(
                            `https://api.github.com/repos/${username}/${repoName}`,
                            { headers: headers }
                        ) // Pasar las opciones en un objeto
                        .then((response) => {
                            if (response.status === 200) {
                                msg.payload = { result: true };
                            } else {
                                msg.payload = { result: false };
                            }
                            node.send(msg);
                        })
                        .catch((error) => {
                            node.error(
                                "Error fetching GitHub repository:",
                                error
                            );
                            msg.payload =
                                ("Error fetching GitHub repository:", error);
                            node.send(msg);
                        });
                } else {
                    node.error("Invalid GitHub repository URL");
                    msg.payload = "Invalid GitHub repository URL";
                    node.send(msg);
                }
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
    RED.nodes.registerType("exists-url", ExistsUrlNode);
};
