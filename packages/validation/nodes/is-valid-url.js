const { v4: uuidv4 } = require('uuid');

module.exports = function (RED) {
    function IsValidURL(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            var property =
                msg.req && msg.req.body && msg.req.body.property !== undefined
                    ? msg.req.body.property
                    : config.property;

            const urlPattern = new RegExp(
                "^(https?:\\/\\/)?" +
                    "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" +
                    "((\\d{1,3}\\.){3}\\d{1,3}))" +
                    "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" +
                    "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" +
                    "(\\#[-a-zA-Z\\d_]*)?$",
                "i"
            );
            let result = false;
            if (urlPattern.test(msg.payload[property])) {
                result = true;
            }
            msg.payload.result = result
            msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];
            msg.payload.evidences.push({
                id: uuidv4(),
                key: "url",
                value: msg.payload[property],
                result: result
            });
            node.send(msg);
        });
    }
    RED.nodes.registerType("is-valid-url", IsValidURL);
};
