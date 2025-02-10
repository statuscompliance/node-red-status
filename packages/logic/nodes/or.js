const { v4: uuidv4 } = require('uuid');

module.exports = function (RED) {
    function BooleanOrNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Almacena los últimos dos payloads
        let payloads = [];
        let evidences = [];

        node.on("input", function (msg) {
            let newMsg = { ...msg };
            newMsg.payload.evidences = Array.isArray(newMsg.payload.evidences) ? newMsg.payload.evidences : [];
            if (typeof newMsg.payload.result === "boolean") {
                payloads.push(newMsg.payload.result);
                evidences = [...evidences, ...newMsg.payload.evidences];
            }
            if (payloads.length === 2) {
                let result = payloads[0] || payloads[1];
                newMsg.payload.evidences.push({
                    id: uuidv4(),
                    key: 'OR operation',
                    value: [payloads[0], payloads[1]],
                    result: result,
                });
                newMsg.payload.result = result;
                payloads = [];
                evidences = [];
                node.send(newMsg);
            }
        });
    }
    RED.nodes.registerType("or", BooleanOrNode);
};
