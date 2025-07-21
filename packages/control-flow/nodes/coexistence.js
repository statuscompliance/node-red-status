const { addEvidence } = require('../../../utils/common.js')

module.exports = function (RED) {
    function CoexistenceNode(config) {
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

            let eventExists = {
                eventA: false,
                eventB: false,
            };

            trace.forEach((event) => {
                if (event.string) {
                    let strings = Array.isArray(event.string)
                        ? event.string
                        : [event.string];

                    let name = strings.find((e) => e.$.key === "concept:name");

                    if (name && name.$.value === eventAName) {
                        eventExists.eventA = true;
                    } else if (name && name.$.value === eventBName) {
                        eventExists.eventB = true;
                    }
                }
            });

            let result;

            if (eventExists.eventA && eventExists.eventB) {
                result = true;
            } else {
                result = false;
            }

            if (negate) {
                result = !result;
            }

            msg.payload.result = result
            msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];

            addEvidence(msg, "Coexistence", [eventAName, eventBName], result, storeEvidences);

            node.send(msg);
        });
    }

    RED.nodes.registerType("coexistence", CoexistenceNode);
};
