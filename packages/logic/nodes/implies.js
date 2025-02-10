const { v4: uuidv4 } = require('uuid');

module.exports = function (RED) {
    function BooleanImplicationNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let payloads = [];
        let evidences = [];

        node.on("input", function (msg) {
            let attribute = msg.req?.body?.attribute ?? config.attribute;
            let expectedStatus = msg.req?.query?.status;
            let newMsg = { ...msg };
            if (typeof newMsg.payload.result === "boolean") {
                payloads.push(newMsg.payload.result);
                evidences = [...evidences, ...newMsg.payload.evidences];
            }
            if (payloads.length === 2) {
                let A = payloads[0];
                let B = payloads[1];
                let implies = !A || B;
                if (implies === true && expectedStatus === "true" || expectedStatus === "false" || expectedStatus === undefined) {
                    newMsg.payload.result = implies;
                    evidences.push({
                        id: uuidv4(),
                        key: 'IMPLIES operation',
                        value: [A, B],
                        result: implies,
                    });
                    newMsg.payload = {
                        ...msg.payload,
                        result: implies,
                        evidences: evidences,
                    };
                    payloads = [];
                    evidences = [];
                    node.send(newMsg);
                } else {
                    payloads = [];
                    evidences = [];
                }
            }
        });
    }
    RED.nodes.registerType("implies", BooleanImplicationNode);
};
