module.exports = function (RED) {
    function RespondedExistence(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on("input", function (msg) {
            var eventAName =
                msg.req && msg.req.body && msg.req.body.eventAName !== undefined
                    ? msg.req.body.eventAName
                    : config.eventAName;
            var eventBName =
                msg.req && msg.req.body && msg.req.body.eventBName !== undefined
                    ? msg.req.body.eventBName
                    : config.eventBName;
            var negate =
                msg.req && msg.req.body && msg.req.body.negate !== undefined
                    ? msg.req.body.negate
                    : config.negate;

            var trace = msg.payload.trace;

            if (!trace || !trace.event || !Array.isArray(trace.event)) {
                node.error("La traza no contiene eventos válidos", msg);
                return;
            }

            // Crear un objeto para almacenar las marcas de tiempo de los eventos
            var eventTimestamps = {
                eventA: null,
                eventB: null,
            };

            // Procesar la traza
            trace.event.forEach((event) => {
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
            // Verificar el orden
            if (eventTimestamps.eventA && eventTimestamps.eventB) {
                if (eventTimestamps.eventA < eventTimestamps.eventB) {
                    newMsg.payload.result = true;
                } else {
                    newMsg.payload.result = false;
                }
            } else {
                newMsg.payload.result = false; // Si uno de los eventos no se encuentra
            }
            if (negate) {
                newMsg.payload.result = !newMsg.payload.result;
            }
            node.send(newMsg);
        });
    }

    RED.nodes.registerType("responded-existence", RespondedExistence);
};
