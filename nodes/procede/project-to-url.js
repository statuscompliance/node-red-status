const axios = require('axios');

module.exports = function (RED) {
    function ProjectToURLNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var cardId = msg.req.body.cardId;
            var apiKey = msg.req.body.apiKey;
            var trelloToken = msg.req.body.trelloToken;
            var githubToken = msg.req.body.githubToken;
            axios.get(`https://api.trello.com/1/cards/${cardId}/attachments?key=${apiKey}&token=${trelloToken}`)
                .then(response => {
                    const attachments = response.data;
                    fetchData(attachments, msg); // Pasar msg como argumento
                })
                .catch(error => {
                    console.error('Error fetching Trello attachments:', error);
                });
        });

        function fetchData(attachments, msg) { // Pasar msg como parámetro
            if (attachments.some(attachment => attachment.url.includes('github'))) { // Usar some para verificar si hay alguna URL de GitHub
                var githubRepoUrl = attachments.find(attachment => attachment.url.includes('github')).url; // Encontrar la URL de GitHub
                msg.payload = githubRepoUrl;
                node.send(msg);
            } else {
                node.error('There is no URL to a GitHub repository in the card');
            }
        }
    }
    RED.nodes.registerType("project-to-url", ProjectToURLNode);
}
