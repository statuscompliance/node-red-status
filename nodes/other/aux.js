const axios = require("axios");

// Importa el módulo de Node-RED
module.exports = function (RED) {
    // La función del nodo
    function AuxNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            var githubToken =
                msg.req && msg.req.body && msg.req.body.eventAName !== undefined
                    ? msg.req.body.eventAName
                    : config.eventAName;
            var headers = {};
            headers["Authorization"] = githubToken;
            let newMsg = { ...msg };

            if (msg.payload) {
                axios
                    .get(msg.payload, { headers: headers })
                    .then((response) => {
                        newMsg.payload = {
                            status: response.status, // Almacena el código de estado
                            data: null, // No almacenar data en caso de éxito
                            datetime: new Date().toISOString(),
                        };
                        node.send(newMsg);
                    })
                    .catch((error) => {
                        newMsg.payload = {
                            status: error.response
                                ? error.response.status
                                : null, // Almacena el código de estado si existe
                            data: error.response
                                ? error.response.data
                                : error.message, // Almacena la data del error o el mensaje del error
                            datetime: new Date().toISOString(),
                        };
                        node.send(newMsg);
                    });
            } else {
                newMsg.payload = "No URL provided";
                node.send(newMsg);
            }
        });
    }

    RED.nodes.registerType("aux", AuxNode);
};
