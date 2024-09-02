module.exports = function (RED) {
    function CheckConceptNameNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", async function (msg) {
            let conceptName =
                msg.req &&
                msg.req.body &&
                msg.req.body.conceptName !== undefined
                    ? msg.req.body.conceptName
                    : config.conceptName;
            let trace = msg.payload.trace;
            if (trace && trace.event && Array.isArray(trace.event)) {
                trace.event.forEach((element) => {
                    if (element.string && Array.isArray(element.string)) {
                        found = element.string.some((eventElement) => {
                            return (
                                eventElement.$ &&
                                eventElement.$.key === "concept:name" &&
                                eventElement.$.value === conceptName
                            );
                        });
                    }
                });
            }

            msg.payload.result = found;
            node.send(msg);
        });
    }
    RED.nodes.registerType("has-activity", CheckConceptNameNode);
};
