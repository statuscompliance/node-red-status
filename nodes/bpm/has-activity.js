module.exports = function (RED) {
    function CheckConceptNameNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", async function (msg, send, done) {
            const globalContext = node.context().global;
            conceptName = globalContext.get("conceptName");
            let trace = msg.payload;
            let found = false;
            if (trace && trace.event && Array.isArray(trace.event)) {
                trace.event.forEach((element) => {
                    if (element.string && Array.isArray(element.string)) {
                        element.string.forEach((eventElement) => {
                            if (
                                eventElement.$ &&
                                eventElement.$.key === "concept:name" &&
                                eventElement.$.value === conceptName
                            ) {
                                found = true;
                            }
                        });
                    }
                });
            }

            msg.payload = found;
            send(msg);
            done();
        });
    }
    RED.nodes.registerType("has-activity", CheckConceptNameNode);
};
