module.exports = function (RED) {
    function LesserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        let payloads = {};

        node.on("input", function (msg) {
            payloads[Number(msg.position) - 1] = msg.payload;
            if (Object.keys(payloads).length === 2) {
                if (
                    typeof payloads[0] !== "number" ||
                    typeof payloads[1] !== "number"
                ) {
                    msg.payload = false;
                    node.send(msg);
                }
                let result = payloads[0] < payloads[1];
                msg.payload = result;
                node.send(msg);
                payloads = {};
            }
        });
    }
    RED.nodes.registerType("lesser-than", LesserNode);
};
