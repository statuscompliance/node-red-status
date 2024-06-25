module.exports = function (RED) {
    function BooleanAndNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Almacena los últimos dos payloads
        let payloads = [];

        this.on("input", function (msg, send, done) {
            // Añade el nuevo payload al array
            payloads.push(msg.payload);

            // Si hay dos payloads, realiza la operación AND
            node.warn("Payloads: " + payloads); //BORRAR

            if (payloads.length === 2) {
                let result = payloads[0] && payloads[1];
                node.warn("Result: " + result); //BORRAR
                send({ payload: result });

                // Reinicia el array de payloads
                payloads = [];
            }

            done();
        });
    }
    RED.nodes.registerType("and", BooleanAndNode);
};
