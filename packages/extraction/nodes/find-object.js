module.exports = function (RED) {
    function FindObjectNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            var array = msg.payload;

            let key = msg.req?.body?.key ?? config.key;
            let keyValue = msg.req?.body?.keyValue ?? config.keyValue;

            if (!Array.isArray(array)) {
                node.error("Payload must be an array");
                return;
            }
            if (!key || !keyValue) {
                node.error("Key and keyValue must be defined");
                return;
            }

            var foundObject = array.find((obj) => obj[key] === keyValue);

            msg.payload = foundObject || null;
            msg.array = array;

            node.send(msg);
        });
    }
    RED.nodes.registerType("find-object", FindObjectNode);
};
