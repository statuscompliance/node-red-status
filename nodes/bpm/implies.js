module.exports = function (RED) {
    function BooleanImplicationNode(config) {
        RED.nodes.createNode(this, config);

        // Almacena los últimos dos payloads
        let payloads = [];

        this.on("input", function (msg, send, done) {
            // Añade el nuevo payload al array
            payloads.push(msg.payload);

            // Si hay dos payloads, realiza la operación de implicación

            if (payloads.length === 2) {
                let A = payloads[0];
                let B = payloads[1];
                let result = !A || B;
                send({ payload: result, req: msg.req, res: msg.res });

                // Reinicia el array de payloads
                payloads = [];
            }

            done();
        });
    }
    RED.nodes.registerType("implies", BooleanImplicationNode);
};
