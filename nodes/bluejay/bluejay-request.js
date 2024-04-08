const axios = require('axios');

module.exports = function (RED) {
    function BluejayRequest(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            var url = config.url;
            axios.get(url)
                .then(response => {
                    msg.payload = response.data;
                    node.send(msg);
                })
                .catch(error => {
                    node.error('Error fetching URL info:', error);
                    msg.payload = ('Error fetching URL info:', error);
                    node.send(msg);
                });
        });
    }
    RED.nodes.registerType("bluejay-request", BluejayRequest);
}
