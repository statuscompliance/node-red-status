module.exports = function (RED) {
    function ChainResponseNode(config) {
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

            var time =
                msg.req && msg.req.body && msg.req.body.time !== undefined
                    ? msg.req.body.time
                    : config.time;

            var trace = msg.payload;

            if (!trace || !trace.event || !Array.isArray(trace.event)) {
                node.error("La traza no contiene eventos válidos", msg);
                return;
            }

            var eventTimes = {
                eventA: null,
                eventB: null,
            };

            trace.event.forEach((event) => {
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

            // Verificar si B ocurre inmediatamente después de A
            if (eventTimes.eventA && eventTimes.eventB) {
                // Aquí se puede definir lo que significa "acto seguido" (ej., 1 minuto después)
                let timeDifference = eventTimes.eventB - eventTimes.eventA;
                // Define el umbral para considerar B como "acto seguido" (ej., 1 minuto)
                let threshold = time * 1000; // 1 minuto en milisegundos

                if (timeDifference >= 0 && timeDifference <= threshold) {
                    msg.payload = true;
                } else {
                    msg.payload = false;
                }
            } else {
                msg.payload = false;
            }

            if (negate) {
                msg.payload = !msg.payload;
            }
            node.send(msg);
        });
    }

    RED.nodes.registerType("chain-response", ChainResponseNode);
};
