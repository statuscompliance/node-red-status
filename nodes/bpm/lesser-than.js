module.exports = function (RED) {
    function LesserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Almacena los últimos dos payloads
        let payloads = [];

        this.on("input", function (msg, send, done) {
            // Añade el nuevo payload al array
            payloads.push(msg.payload);

            // Si hay dos payloads, realiza la operación AND
            if (payloads.length === 2) {
                let result = payloads[0] < payloads[1];
                send({ payload: result });

                // Reinicia el array de payloads
                payloads = [];
            }

            done();
        });
    }
    RED.nodes.registerType("lesser-than", LesserNode);
};
