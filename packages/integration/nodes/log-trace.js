module.exports = function (RED) {
    function LogTraceNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            try {
                let logData = msg.log;
                if (
                    logData &&
                    logData.log &&
                    logData.log.trace &&
                    logData.log.trace.length > 0
                ) {
                    logData.log.trace.forEach((trace, i) => {
                        let newMsg = { ...msg };
                        newMsg.payload = {
                            trace: trace,
                            index: parseInt(i),
                        };
                        newMsg.logSize = logData.log.trace.length;
                        newMsg.log = null;
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
