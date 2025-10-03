const { addEvidence } = require('@statuscompliance/commons')

module.exports = function (RED) {
    function ResponseNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on("input", async function (msg) {
            let eventAName = msg.req?.body?.eventAName ?? config.eventAName;
            let eventBName = msg.req?.body?.eventBName ?? config.eventBName;
            let negate = msg.req?.body?.negate ?? config.negate;
            let storeEvidences = config.storeEvidences;

            let trace = (msg.payload.trace && msg.payload.trace.event) || msg.payload.event || msg.payload.events || msg.payload || [];


            if (!Array.isArray(trace)) {
                node.error("The trace is not in the expected format. Expected an array in trace.event.");
                return;
            }

            let foundA = false;
            let foundB = false;
            let isFollowed = false;

            trace.forEach((event) => {
                if (event.string) {
                    let strings = Array.isArray(event.string)
                        ? event.string
                        : [event.string];

                    let name = strings.find((e) => e.$.key === "concept:name");
                    if (name) {
                        if (name.$.value === eventAName) {
                            foundA = true;
                        } else if (name.$.value === eventBName) {
                            if (foundA) {
                                isFollowed = true;
                                foundA = false;
                            }
                            foundB = true;
                        }
                    }
                }
            });

            let result = isFollowed;

            if (negate) {
                result = !msg.payload;
            }

            msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];
            
            await addEvidence(msg, "Response", [eventAName, eventBName], result, storeEvidences);
            
            node.send(msg);
        });
    }

    RED.nodes.registerType("response", ResponseNode);
};
