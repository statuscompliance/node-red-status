const { addEvidence } = require('@statuscompliance/commons')
const axios = require('axios');

module.exports = function (RED) {
    function ChainResponseNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on("input", async function (msg) {
            if (config.enablePCM) {
                let mlUrl = msg.req?.body?.mlUrl ?? config.mlUrl;
                let mlEndpoint = msg.req?.body?.mlEndpoint ?? config.mlEndpoint;
                
                if (!mlUrl || !mlEndpoint) {
                    node.error("ML URL and ML Endpoint must be defined when PCM is enabled");
                    return;
                }
                
                try {
                    const fullUrl = mlUrl.endsWith('/') ? mlUrl + mlEndpoint.substring(1) : mlUrl + mlEndpoint;
                    
                    const response = await axios.post(fullUrl, msg.payload, {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: 10000
                    });
                    
                    let result = false;
                    if (response.data && response.data.prediction !== undefined) {
                        result = response.data.prediction;
                    } else {
                        node.warn("ML service response does not contain 'prediction' property");
                    }
                    
                    msg.payload.result = result;
                    msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];

                    await addEvidence(
                        msg,
                        "Chain Response (PCM)",
                        {
                            mlUrl: mlUrl,
                            mlEndpoint: mlEndpoint,
                            prediction: result
                        },
                        result, 
                        config.storeEvidences
                    );
                    
                    return node.send(msg);
                    
                } catch (error) {
                    node.error("Error calling ML service: " + error.message);
                    msg.payload.result = false;
                    msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];
                    return node.send(msg);
                }
            }

            let eventAName = msg.req?.body?.eventAName ?? config.eventAName;
            let eventBName = msg.req?.body?.eventBName ?? config.eventBName;
            let negate = msg.req?.body?.negate ?? config.negate;
            let time = msg.req?.body?.time ?? config.time;
            let storeEvidences = config.storeEvidences;

            let trace = (msg.payload.trace && msg.payload.trace.event) || msg.payload.event || msg.payload.events || msg.payload || [];
            if (!Array.isArray(trace)) {
                node.error("Invalid data format. Expected an array in trace.event or events.");
                msg.payload.result = false;
                return node.send(msg);
            }

            let eventTimes = {
                eventA: null,
                eventB: null,
            };

            trace.forEach((event) => {
                if (event.string) {
                    let strings = Array.isArray(event.string)
                        ? event.string
                        : [event.string];

                    let name = strings.find((e) => e.$.key === "concept:name");
                    let timestamp = event.date
                        ? new Date(event.date[0].$.value)
                        : null;
                    if (name && timestamp) {
                        if (name.$.value === eventAName) {
                            eventTimes.eventA = timestamp;
                        } else if (name.$.value === eventBName) {
                            eventTimes.eventB = timestamp;
                        }
                    }
                }
            });

            let result;
            if (eventTimes.eventA && eventTimes.eventB) {
                let timeDifference = eventTimes.eventB - eventTimes.eventA;
                let threshold = time * 1000;

                if (timeDifference >= 0 && timeDifference <= threshold) {
                    result = true;
                } else {
                    result = false;
                }
            } else {
                result = false;
            }

            if (negate) {
                result = !result;
            }
            msg.payload.result = result;
            msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];

            await addEvidence(
                msg,
                "Chain Response",
                {
                    eventA: {
                        timestamp: eventTimes.eventA,
                        value: eventAName
                    }, 
                    eventB: {
                        timestamp: eventTimes.eventB,
                        value: eventBName
                    }
                },
                result, 
                storeEvidences
            );
            node.send(msg);
        });
    }

    RED.nodes.registerType("chain-response", ChainResponseNode);
};
