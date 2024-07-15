module.exports = function (RED) {
    function BooleanImplicationNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let payloads = [];

        node.on("input", function (msg) {
            var expectedStatus = msg.req.query.Status;
            if (typeof msg.payload === "boolean") {
                payloads.push(msg.payload);
            }
            if (payloads.length === 2) {
                let A = payloads[0];
                let B = payloads[1];
                let implies = !A || B;
                if (implies === true && expectedStatus === "true") {
                    msg.payload = { result: implies };
                    payloads = [];
                    node.send(msg);
                } else if (expectedStatus === "false") {
                    msg.payload = { result: implies };
                    payloads = [];
                    node.send(msg);
                } else {
                    payloads = [];
                }
            }
        });
    }
    RED.nodes.registerType("implies", BooleanImplicationNode);
};
