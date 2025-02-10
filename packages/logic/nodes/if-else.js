module.exports = function (RED) {
    function IfElseNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on("input", function (msg) {
            const result = msg.payload.result;
            if (result === true) {
                node.send([msg, null]);
            } else if (result === false) {
                node.send([null, msg]);
            } else {
                node.error("msg.payload.result is not boolean", msg);
            }
        });
    }

    RED.nodes.registerType("if-else", IfElseNode);
};
