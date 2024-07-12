module.exports = function (RED) {
    function BooleanAndNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Almacena los últimos dos payloads
        let payloads = [];

        node.on("input", function (msg, send, done) {
            // Añade el nuevo payload al array
            payloads.push(msg.payload);

            // Si hay dos payloads, realiza la operación AND
            if (payloads.length === 2) {
                let result = payloads[0] && payloads[1];
                msg.payload = result;
                node.send(msg);

                // Reinicia el array de payloads
                payloads = [];
            }
        });
    }
    RED.nodes.registerType("and", BooleanAndNode);
};
