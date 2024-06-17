const axios = require("axios");

module.exports = function (RED) {
    function GitHubCollectorNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        this.on("input", function (msg) {
            var username = msg.req.body.username || config.username;
            var repoName = msg.req.body.repoName || config.repoName;
            var path = msg.req.body.path || config.path;
            var token = msg.req.body.token || config.token; // GitHub token
            var apiUrl = "";
            if (path === "") {
                apiUrl = `https://api.github.com/repos/${username}/${repoName}/contents`;
            } else {
                apiUrl = `https://api.github.com/repos/${username}/${repoName}/contents/${path}`;
            }

            const config = {
                headers: {
                    Authorization: `token ${token}`,
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
