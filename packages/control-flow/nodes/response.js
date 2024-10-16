module.exports = function (RED) {
    function ResponseNode(config) {
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

            let foundA = false;
            let foundB = false;
            let isFollowed = false;

            // Procesar la traza
            trace.event.forEach((event) => {
                if (event.string) {
                    let strings = Array.isArray(event.string)
                        ? event.string
                        : [event.string];

                    let name = strings.find((e) => e.$.key === "concept:name");
                    if (name) {
                        if (name.$.value === eventAName) {
                            foundA = true;
                            // Marca que A ha sido encontrado
                        } else if (name.$.value === eventBName) {
                            if (foundA) {
                                // B es el siguiente evento después de A
                                isFollowed = true;
                                foundA = false; // Resetea para encontrar otro par A-B
                            }
                            foundB = true;
                        }
                    }
                }
            });

            msg.payload = isFollowed;

            if (negate) {
                msg.payload = !msg.payload;
            }
            node.send(msg);
        });
    }

    RED.nodes.registerType("response", ResponseNode);
};
