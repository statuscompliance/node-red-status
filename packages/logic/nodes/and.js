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
    function BooleanAndNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

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
                let A = payloads[0];
                let B = payloads[1];
                let and = A && B;
                if(storeEvidences){
                    const uuid = await initUuid();
                    evidences.push({
                        id: uuid(),
                        key: 'AND operation',
                        value: [A, B],
                        result: and,
                    });
                }
                newMsg.payload = {
                    ...msg.payload,
                    result: and,
                    evidences: evidences,
                };
                payloads = [];
                evidences = [];
                node.send(newMsg);
            }
        });
    }
    RED.nodes.registerType("and", BooleanAndNode);
};
