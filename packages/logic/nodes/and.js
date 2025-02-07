const { v4: uuidv4 } = require('uuid');

module.exports = function (RED) {
    function BooleanAndNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Almacena los últimos dos payloads
        let payloads = [];
        let evidences = [];

        node.on("input", function (msg) {
            let newMsg = { ...msg };
            if (typeof newMsg.payload.result === "boolean") {
                payloads.push(newMsg.payload.result);
                evidences = [...evidences, ...newMsg.payload.evidences];
            }
            if (payloads.length === 2) {
                let A = payloads[0];
                let B = payloads[1];
                let and = A && B;
                evidences.push({
                    id: uuidv4(),
                    key: 'AND operation',
                    value: [ A, B],
                    result: and,
                });

                delete newMsg.payload;
                newMsg.payload = {
                    ...msg.payload,
                    result: and,
                    evidences: evidences,
                };
                payloads = [];
                evidences = [];
                node.send(newMsg);
            }
        });
    }
    RED.nodes.registerType("and", BooleanAndNode);
};
