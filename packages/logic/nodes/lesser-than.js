let uuidv4 = null;

async function initUuid() {
    if (!uuidv4) {
        const { v4 } = await import('uuid');
        uuidv4 = v4;
    }
    return uuidv4;
}

module.exports = function (RED) {
    function LesserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        let payloads = [];
        let evidences = [];

        function getNestedValue(obj, path) {
            return path.split('.').reduce((current, key) => current && current[key], obj);
        }

        function getValue(payload, position, lesserProperty, aValue, bValue) {
            if (position === 1 && aValue !== undefined && aValue !== null && aValue !== '') {
                return parseFloat(aValue);
            }
            if (position === 2 && bValue !== undefined && bValue !== null && bValue !== '') {
                return parseFloat(bValue);
            }

            const property = lesserProperty || 'result';
            const value = getNestedValue(payload, property);
            return typeof value === 'number' ? value : undefined;
        }

        node.on("input", async function (msg) {
            let newMsg = { ...msg };
            let storeEvidences = config.storeEvidences;
            
            let lesserProperty = msg.req?.body?.lesserProperty || config.lesserProperty || '';
            if (!lesserProperty) {
                lesserProperty = 'result';
            }

            const aValue = msg.req?.body?.aValue || config.aValue;
            const bValue = msg.req?.body?.bValue || config.bValue;

            if (aValue !== undefined && aValue !== null && aValue !== '' && payloads[0] === undefined) {
                payloads[0] = {
                    value: parseFloat(aValue),
                    payload: { result: parseFloat(aValue) }
                };
            }
            
            if (bValue !== undefined && bValue !== null && bValue !== '' && payloads[1] === undefined) {
                payloads[1] = {
                    value: parseFloat(bValue),
                    payload: { result: parseFloat(bValue) }
                };
            }

            const position = Number(newMsg.position);
            const currentValue = getValue(newMsg.payload, position, lesserProperty, aValue, bValue);
            
            payloads[position - 1] = {
                value: currentValue,
                payload: newMsg.payload
            };

            newMsg.payload.evidences = Array.isArray(newMsg.payload.evidences) ? newMsg.payload.evidences : [];
            
            if (Object.keys(payloads).length === 2 && payloads[0] !== undefined && payloads[1] !== undefined) {
                evidences = newMsg.payload?.evidences ? [...evidences, ...newMsg.payload.evidences] : evidences;

                const firstValue = payloads[0].value;
                const secondValue = payloads[1].value;
                
                const isValidNumber = (value) => typeof value === "number" && !isNaN(value);
                const result = isValidNumber(firstValue) && isValidNumber(secondValue) && firstValue < secondValue;

                if (storeEvidences) {
                    const uuid = await initUuid();
                    evidences.push({
                        id: uuid(),
                        name: "LESSER_THAN operation",
                        value: [firstValue, secondValue],
                        result: result,
                        property: lesserProperty
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
            } else {
                evidences = newMsg.payload?.evidences ? [...evidences, ...newMsg.payload.evidences] : evidences;
            }
        });
    }
    RED.nodes.registerType("lesser-than", LesserNode);
};
