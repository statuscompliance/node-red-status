const axios = require("axios");

module.exports = function (RED) {
    function GitHubCollectorNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        this.on("input", function (msg) {
            username = msg.req.body.username || config.username;
            repoName = msg.req.body.repoName || config.repoName;
            path = msg.req.body.path || config.path;
            token = msg.req.body.token || config.token; // GitHub token
            var apiUrl = "";
            if (node.path === "") {
                apiUrl = `https://api.github.com/repos/${node.username}/${node.repoName}/contents`;
            } else {
                apiUrl = `https://api.github.com/repos/${node.username}/${node.repoName}/contents/${node.path}`;
            }

            const config = {
                headers: {
                    Authorization: `token ${node.token}`,
                },
            };

            axios
                .get(apiUrl, config)
                .then((response) => {
                    if (response.status !== 200) {
                        msg.payload = false;
                    } else {
                        msg.payload = response.data;
                    }
                    node.send(msg);
                })
                .catch((error) => {
                    node.error(error, msg);
                });
        });
    }

    RED.nodes.registerType("github-collector", GitHubCollectorNode);
};
