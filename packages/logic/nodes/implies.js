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
    function BooleanImplicationNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let payloads = [];
        let evidences = [];

        node.on("input", async function (msg) {
            let expectedStatus = msg.req?.query?.status;
            let newMsg = { ...msg };
            let storeEvidences = config.storeEvidences;
            newMsg.payload.evidences = Array.isArray(newMsg.payload.evidences) ? newMsg.payload.evidences : [];
            if (typeof newMsg.payload.result === "boolean") {
                payloads.push(newMsg.payload.result);
                if (evidences.length > 0) {
                    evidences = evidences.concat(newMsg.payload.evidences);
                } else {
                    evidences = newMsg.payload.evidences;
                }
            }
            if (payloads.length === 2) {
                let A = payloads[0];
                let B = payloads[1];
                let implies = !A || B;
                if (implies === true && expectedStatus === "true" || expectedStatus === "false" || expectedStatus === undefined) {
                    newMsg.payload.result = implies;
                    if(storeEvidences){
                        const uuid = await initUuid();
                        evidences.push({
                            id: uuid(),
                            key: 'IMPLIES operation',
                            value: [A, B],
                            result: implies,
                        });
                    }
                    newMsg.payload = {
                        ...msg.payload,
                        result: implies,
                        evidences: evidences,
                    };
                    node.send(newMsg);
                }
                payloads = [];
                evidences = [];
            }
        });
    }
    RED.nodes.registerType("implies", BooleanImplicationNode);
};
