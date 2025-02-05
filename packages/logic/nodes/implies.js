module.exports = function (RED) {
    function BooleanImplicationNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let payloads = [];

        node.on("input", function (msg) {
            msg.req && msg.req.body && msg.req.body.attribute !== undefined ? msg.req.body.attribute : config.attribute;
            var expectedStatus = msg.req && msg.req.query && msg.req.query.status !== undefined ? msg.req.query.status : undefined;
            let newMsg = { ...msg };
            if (typeof newMsg.payload.result === "boolean") {
                payloads.push(newMsg.payload.result);
            }
            if (payloads.length === 2) {
                let A = payloads[0];
                let B = payloads[1];
                let implies = !A || B;
                if (implies === true && expectedStatus === "true") {
                    newMsg.payload.result = implies;
                    payloads = [];
                    node.send(newMsg);
                } else if (expectedStatus === "false") {
                    newMsg.payload.result = implies;
                    payloads = [];
                    node.send(newMsg);
                } else if (expectedStatus === undefined) {
                    newMsg.payload.result = implies;
                    payloads = [];
                    node.send(newMsg);
                } else {
                    payloads = [];
                }
            }
        });
    }
    RED.nodes.registerType("implies", BooleanImplicationNode);
};
