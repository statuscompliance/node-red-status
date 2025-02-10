const { v4: uuidv4 } = require('uuid');

module.exports = function (RED) {
    function LesserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        let payloads = {};
        let evidences = [];

        node.on("input", function (msg) {
            payloads[Number(msg.position) - 1] = msg.payload;
            msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];
            if (Object.keys(payloads).length === 2) {
                evidences = [...evidences, ...newMsg.payload.evidences];
                if (
                    typeof payloads[0] !== "number" ||
                    typeof payloads[1] !== "number"
                ) {
                    msg.payload.result = false;
                    msg.payload.evidences.push({
                        id: uuidv4(),
                        name: "LESSER_THAN operation",
                        value: [payloads[0], payloads[1]],
                        result: false,
                    });
                    payloads = {};
                    evidences = [];
                    node.send(msg);
                }
                let result = payloads[0] < payloads[1];
                msg.payload.result = result;
                msg.payload.evidences.push({
                    id: uuidv4(),
                    name: "LESSER_THAN operation",
                    value: [payloads[0], payloads[1]],
                    result: result,
                });
                payloads = {};
                evidences = [];
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("lesser-than", LesserNode);
};
