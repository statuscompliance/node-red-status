module.exports = function (RED) {
    function CheckPropertyNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        node.on("input", function (msg) {
            // Obtiene la propiedad y el valor desde la configuración del nodo
            var propertyToCheck =
                config.propertyToCheck || msg.req.body.propertyToCheck;
            var expectedValue =
                config.expectedValue || msg.req.body.expectedValue;

            // Verifica si la propiedad existe en el mensaje recibido
            if (
                msg.payload &&
                typeof msg.payload === "object" &&
                msg.payload.hasOwnProperty(propertyToCheck)
            ) {
                // Obtiene el valor de la propiedad dentro de msg.payload
                var propertyValue = msg.payload[propertyToCheck];

                // Compara el valor de la propiedad con el valor esperado
                var isMatching = propertyValue === expectedValue;

                // Crea el mensaje de salida con el booleano
                msg.payload = isMatching;

                // Envía el mensaje de salida
                node.send(msg);
            } else {
                // Si la propiedad no existe, envía false
                msg.payload = false;
                node.send(msg);
            }
        });
    }

    RED.nodes.registerType("check-property", CheckPropertyNode);
};
