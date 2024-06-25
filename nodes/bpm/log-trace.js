module.exports = function (RED) {
    function LogTraceNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            try {
                let logData = msg.payload;
                if (
                    logData &&
                    logData.log &&
                    logData.log.trace &&
                    logData.log.trace.length > 0
                ) {
                    logData.log.trace.forEach((trace) => {
                        let newMsg = { payload: trace };
                        node.send(newMsg);
                    });
                } else {
                    node.error("No trace data found in the log.");
                }
            } catch (err) {
                node.error("Error processing log data: " + err.message);
            }
        });
    }
    RED.nodes.registerType("log-trace", LogTraceNode);
};
