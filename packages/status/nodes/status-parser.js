module.exports = function (RED) {
    function StatusParser(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            let newMsg = { ...msg };
            let status = newMsg.req?.query?.status ?? "";

            if (status === "true" || status === "false") {
                const filterValue = status === "true";
                newMsg.payload = newMsg.payload.filter(
                    (obj) => obj.result === filterValue
                );
            }
            node.send(newMsg);
        });
    }
    RED.nodes.registerType("status-parser", StatusParser);
};
