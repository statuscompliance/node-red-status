let uuidv4 = null;

// Función para inicializar uuid de forma asíncrona
async function initUuid() {
    if (!uuidv4) {
        const { v4 } = await import('uuid');
        uuidv4 = v4;
    }
    return uuidv4;
}

module.exports = function (RED) {
    function BooleanOrNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Almacena los últimos dos payloads
        let payloads = [];
        let evidences = [];

        node.on("input", async function (msg) {
            let newMsg = { ...msg };
            let storeEvidences = config.storeEvidences;
            newMsg.payload.evidences = Array.isArray(newMsg.payload.evidences) ? newMsg.payload.evidences : [];
            if (typeof newMsg.payload.result === "boolean") {
                payloads.push(newMsg.payload.result);
                evidences = evidences.concat(newMsg.payload.evidences);
            }
            if (payloads.length === 2) {
                let result = payloads[0] || payloads[1];
                if(storeEvidences){
                    const uuid = await initUuid();
                    evidences.push({
                        id: uuid(),
                        key: 'OR operation',
                        value: [payloads[0], payloads[1]],
                        result: result,
                    });
                }
                newMsg.payload = {
                    ...msg.payload,
                    result: result,
                    evidences: evidences,
                };
                payloads = [];
                evidences = [];
                node.send(newMsg);
            }
        });
    }
    RED.nodes.registerType("or", BooleanOrNode);
};
