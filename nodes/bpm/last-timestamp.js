module.exports = function (RED) {
    function LastTimestampNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            try {
                let trace = msg.payload;
                if (trace && trace.event) {
                    let latestTimestamp = null;
                    trace.event.forEach((event) => {
                        event.date.forEach((date) => {
                            if (date.$.key === "time:timestamp") {
                                let timestamp = new Date(date.$.value);
                                if (
                                    !latestTimestamp ||
                                    timestamp > latestTimestamp
                                ) {
                                    latestTimestamp = timestamp;
                                }
                            }
                        });
                    });
                    if (latestTimestamp) {
                        node.send({
                            payload: latestTimestamp.getTime(),
                            req: msg.req,
                            res: msg.res,
                        });
                    } else {
                        node.error("No timestamp found in the trace events.");
                    }
                } else {
                    node.error("No events found in the trace.");
                }
            } catch (err) {
                node.error("Error processing trace data: " + err.message);
            }
        });
    }
    RED.nodes.registerType("last-timestamp", LastTimestampNode);
};
