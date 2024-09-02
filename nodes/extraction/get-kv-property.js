module.exports = function (RED) {
    function GetKVPropertyNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        node.on("input", function (msg) {
            var keyToSearch =
                msg.req &&
                msg.req.body &&
                msg.req.body.keyToSearch !== undefined
                    ? msg.req.body.keyToSearch
                    : config.keyToSearch;
            var payloadProperty =
                msg.req &&
                msg.req.body &&
                msg.req.body.payloadProperty !== undefined
                    ? msg.req.body.payloadProperty
                    : config.payloadProperty;
            var response =
                msg.req && msg.req.body && msg.req.body.response !== undefined
                    ? msg.req.body.response
                    : config.response;

            var trace = null;

            if (
                msg.payload &&
                typeof msg.payload === "object" &&
                msg.payload.hasOwnProperty(payloadProperty)
            ) {
                trace = msg.payload[payloadProperty];
            } else {
                node.error("La traza no contiene eventos válidos", msg);
                return;
            }

            let value = null;

            if (typeof trace === "object") {
                function findKeyValue(obj, key) {
                    if (typeof obj === "object" && obj !== null) {
                        for (let prop in obj) {
                            if (obj.hasOwnProperty(prop)) {
                                if (Array.isArray(obj[prop])) {
                                    for (let i = 0; i < obj[prop].length; i++) {
                                        let result = findKeyValue(
                                            obj[prop][i],
                                            key
                                        );
                                        if (result) return result;
                                    }
                                } else if (typeof obj[prop] === "object") {
                                    let result = findKeyValue(obj[prop], key);
                                    if (result) return result;
                                }
                            }
                        }
                        if (obj.$ && obj.$.key === key) {
                            return obj.$.value;
                        }
                    }
                    return null;
                }

                value = findKeyValue(trace, keyToSearch);
                if (trace && keyToSearch) {
                    value = findKeyValue(trace, keyToSearch);
                } else {
                    value = "Error: Entrada no válida";
                }

                msg.payload[response] = value;
                node.send(msg);
            } else {
                return null;
            }
        });
    }

    RED.nodes.registerType("get-kv-property", GetKVPropertyNode);
};
