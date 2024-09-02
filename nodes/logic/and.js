module.exports = function (RED) {
    function BooleanAndNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Almacena los últimos dos payloads
        let payloads = [];

        node.on("input", function (msg) {
            let newMsg = { ...msg };
            if (typeof newMsg.payload.result === "boolean") {
                payloads.push(newMsg.payload.result);
            }
            if (payloads.length === 2) {
                let A = payloads[0];
                let B = payloads[1];
                let and = A && B;
                newIndex = msg.payload.index;
                delete newMsg.payload;
                newMsg.payload = {
                    result: and,
                    index: newIndex,
                };
                payloads = [];
                node.send(newMsg);
            }
        });
    }
    RED.nodes.registerType("and", BooleanAndNode);
};
