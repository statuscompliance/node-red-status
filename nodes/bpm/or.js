module.exports = function (RED) {
    function BooleanOrNode(config) {
        RED.nodes.createNode(this, config);

        // Almacena los últimos dos payloads
        let payloads = [];

        this.on("input", function (msg, send, done) {
            // Añade el nuevo payload al array
            payloads.push(msg.payload);

            // Si hay dos payloads, realiza la operación AND
            if (payloads.length === 2) {
                let result = payloads[0] || payloads[1];
                msg.payload = result;
                send(msg);

                // Reinicia el array de payloads
                payloads = [];
            }

            done();
        });
    }
    RED.nodes.registerType("or", BooleanOrNode);
};
