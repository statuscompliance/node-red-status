module.exports = function (RED) {
    function GetPropertyValueNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Evento al recibir un mensaje
        node.on("input", function (msg) {
            // Obtener el objeto del mensaje
            var obj = msg.payload || null;

            // Obtener la key del config o del mensaje
            let propertyToGet =
                msg.req &&
                msg.req.body &&
                msg.req.body.propertyToGet !== undefined
                    ? msg.req.body.propertyToGet
                    : config.propertyToGet;

            msg.payload = msg.array;
            // Verificar si obj es un objeto y key está definido
            if (typeof obj !== "object" || obj === null) {
                msg.value = null;
                node.send(msg);
            } else {
                if (!propertyToGet) {
                    node.error("Key must be defined");
                    return;
                }

                // Obtener el valor de la propiedad especificada
                var value = obj[propertyToGet];

                // Asignar el valor al payload del mensaje
                msg.value = value !== undefined ? value : null;

                // Enviar el mensaje al siguiente nodo
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("get-property-value", GetPropertyValueNode);
};
