module.exports = function (RED) {
    function StatusParser(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            newMsg = { ...msg };
            let status = newMsg.req.query.status;

            if (status === "true") {
                newMsg.payload = newMsg.payload.filter(
                    (obj) => obj.result === true
                );
            } else if (status === "false") {
                newMsg.payload = newMsg.payload.filter(
                    (obj) => obj.result === false
                );
            } else {
                newMsg.payload = newMsg.payload;
            }
            node.send(newMsg);
        });
    }
    RED.nodes.registerType("status-parser", StatusParser);
};
