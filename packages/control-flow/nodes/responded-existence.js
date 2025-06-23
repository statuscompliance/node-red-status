const { v4: uuidv4 } = require('uuid');
const { addEvidence } = require('../../../utils/common.js')

module.exports = function (RED) {
    function RespondedExistence(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on("input", function (msg) {
            let eventAName = msg.req?.body?.eventAName ?? config.eventAName;
            let eventBName = msg.req?.body?.eventBName ?? config.eventBName;
            let negate = msg.req?.body?.negate ?? config.negate;
            let storeEvidences = config.storeEvidences;

            let trace = (msg.payload.trace && msg.payload.trace.event) || msg.payload.event || msg.payload.events || msg.payload || [];

            if (!Array.isArray(trace)) {
                node.error("Invalid data format. Expected an array in trace.event or events.");
                msg.payload.result = false;
                return node.send(msg);
            }

            let eventTimestamps = {
                eventA: null,
                eventB: null,
            };

            trace.forEach((event) => {
                if (event.string) {
                    let strings = Array.isArray(event.string)
                        ? event.string
                        : [event.string];

                    let name = strings.find((e) => e.$.key === "concept:name");
                    let timestamp =
                        event.date &&
                            event.date[0].$["key"] === "time:timestamp"
                            ? new Date(event.date[0].$.value)
                            : null;
                    if (name && timestamp) {
                        if (name.$.value === eventAName) {
                            eventTimestamps.eventA = timestamp;
                        } else if (name.$.value === eventBName) {
                            eventTimestamps.eventB = timestamp;
                        }
                    }
                }
            });
            let newMsg = { ...msg };

            newMsg.payload.evidences = Array.isArray(newMsg.payload.evidences) ? newMsg.payload.evidences : [];

            let result = false;
            if (eventTimestamps.eventA && eventTimestamps.eventB) {
                result = eventTimestamps.eventA < eventTimestamps.eventB;
            }

            if (negate) {
                result = !result;
            }

            newMsg.payload.result = result;

            addEvidence(newMsg, `${eventAName}-${eventBName}`, [eventTimestamps.eventA, eventTimestamps.eventB], result, storeEvidences);

            node.send(newMsg);
        });
    }

    RED.nodes.registerType("responded-existence", RespondedExistence);
};
