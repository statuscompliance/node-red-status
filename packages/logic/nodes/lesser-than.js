const { v4: uuidv4 } = require('uuid');

module.exports = function (RED) {
    function LesserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        let payloads = [];
        let evidences = [];

        node.on("input", function (msg) {
            let newMsg = { ...msg };
            payloads[Number(newMsg.position) - 1] = newMsg.payload;
            let storeEvidences = config.storeEvidences;
            newMsg.payload.evidences = Array.isArray(newMsg.payload.evidences) ? newMsg.payload.evidences : [];
            if (Object.keys(payloads).length === 2) {
                evidences = newMsg.payload?.evidences ? [...evidences, ...newMsg.payload.evidences] : evidences;

                const [firstPayload, secondPayload] = [payloads[0], payloads[1]];
                const isValidNumber = (value) => typeof value === "number";
                const result = isValidNumber(firstPayload?.result) && isValidNumber(secondPayload?.result) && firstPayload?.result < secondPayload?.result;

                if (storeEvidences) {
                    evidences.push({
                        id: uuidv4(),
                        name: "LESSER_THAN operation",
                        value: [firstPayload?.result, secondPayload?.result],
                        result: result,
                    });
                }

                newMsg.payload = {
                    ...msg.payload,
                    result: result,
                    evidences: evidences,
                };
                payloads = [];
                evidences = [];
                node.send(newMsg);
            } else {
                payloads.push(newMsg.payload.result);
                evidences = newMsg.payload?.evidences ? [...evidences, ...newMsg.payload.evidences] : evidences;
            }
        });
    }
    RED.nodes.registerType("lesser-than", LesserNode);
};
