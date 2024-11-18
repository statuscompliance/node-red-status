module.exports = function (RED) {
    function LastTimestampNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            let activity =
                msg.req && msg.req.body && msg.req.body.activity !== undefined
                    ? msg.req.body.activity
                    : config.activity;
            let position =
                msg.req && msg.req.body && msg.req.body.position !== undefined
                    ? msg.req.body.position
                    : config.position;
            try {
                let trace = msg.payload;
                msg.position = position;

                if (trace && trace.event) {
                    let latestTimestamp = null;
                    trace.event.forEach((event) => {
                        let eventactivity = event.string.find(
                            (s) => s.$.key === "concept:name"
                        )?.$.value;
                        if (eventactivity === activity) {
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
                        }
                    });
                    if (latestTimestamp) {
                        msg.payload = latestTimestamp.getTime();
                        node.send(msg);
                    } else {
                        msg.payload = null;
                        node.send(msg);
                    }
                }
            } catch (err) {
                node.error("Error processing trace data: " + err.message);
            }
        });
    }
    RED.nodes.registerType("last-timestamp", LastTimestampNode);
};
