module.exports = function (RED) {
    function CoexistenceNode(config) {
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

            var trace = msg.payload;

            if (!trace || !trace.event || !Array.isArray(trace.event)) {
                node.error("La traza no contiene eventos válidos", msg);
                return;
            }

            // Variables para verificar la existencia de eventos
            var eventExists = {
                eventA: false,
                eventB: false,
            };

            // Procesar la traza
            trace.event.forEach((event) => {
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

            // Verificar si ambos eventos existen
            if (eventExists.eventA && eventExists.eventB) {
                msg.payload = true;
            } else {
                msg.payload = false;
            }

            if (negate) {
                msg.payload = !msg.payload;
            }
            node.send(msg);
        });
    }

    RED.nodes.registerType("coexistence", CoexistenceNode);
};
