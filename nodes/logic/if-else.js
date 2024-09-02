module.exports = function (RED) {
    function IfElseNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            if (msg.payload === true) {
                node.send([msg, null]);
            } else if (msg.payload === false) {
                node.send([null, msg]);
            } else {
                node.error("msg.payload is not boolean", msg);
            }
        });
    }
    RED.nodes.registerType("if-else", IfElseNode);
};
