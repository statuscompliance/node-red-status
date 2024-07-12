module.exports = function (RED) {
    function BooleanImplicationNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let payloads = [];

        node.on("input", function (msg) {
            if (typeof msg.payload === "boolean") {
                payloads.push(msg.payload);
            }
            if (payloads.length === 2) {
                let A = payloads[0];
                let B = payloads[1];
                let implies = !A || B;
                msg.payload = { result: implies };
                payloads = [];
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("implies", BooleanImplicationNode);
};
