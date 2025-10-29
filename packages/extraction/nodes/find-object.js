module.exports = function (RED) {
    function FindObjectNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            var array = msg.payload;

            let key = msg.req?.body?.key ?? config.key;
            let keyValue = msg.req?.body?.keyValue ?? config.keyValue;
            let keyValueType = config.keyValueType || 'str';

            if (!Array.isArray(array)) {
                node.error("Payload must be an array");
                return;
            }
            if (!key) {
                node.error("Key must be defined");
                return;
            }
            if (keyValue === undefined || keyValue === null) {
                node.error("KeyValue must be defined");
                return;
            }

            // Convert keyValue based on type
            let searchValue;
            try {
                switch (keyValueType) {
                    case 'str':
                        searchValue = String(keyValue);
                        break;
                    case 'num':
                        searchValue = Number(keyValue);
                        if (isNaN(searchValue)) {
                            node.error("KeyValue is not a valid number");
                            return;
                        }
                        break;
                    case 'bool':
                        if (typeof keyValue === 'boolean') {
                            searchValue = keyValue;
                        } else if (typeof keyValue === 'string') {
                            searchValue = keyValue.toLowerCase() === 'true';
                        } else {
                            searchValue = Boolean(keyValue);
                        }
                        break;
                    case 'json':
                        try {
                            searchValue = JSON.parse(keyValue);
                        } catch (e) {
                            node.error("KeyValue is not valid JSON");
                            return;
                        }
                        break;
                    case 'msg':
                        searchValue = RED.util.getMessageProperty(msg, keyValue);
                        break;
                    case 'flow':
                        searchValue = node.context().flow.get(keyValue);
                        break;
                    case 'global':
                        searchValue = node.context().global.get(keyValue);
                        break;
                    case 'env':
                        searchValue = RED.util.getSetting(node, keyValue);
                        break;
                    case 'date':
                        searchValue = new Date(keyValue);
                        if (isNaN(searchValue.getTime())) {
                            node.error("KeyValue is not a valid date");
                            return;
                        }
                        break;
                    case 'jsonata':
                        try {
                            var expr = RED.util.prepareJSONataExpression(keyValue, node);
                            searchValue = RED.util.evaluateJSONataExpression(expr, msg);
                        } catch (e) {
                            node.error("Error evaluating JSONata expression: " + e.message);
                            return;
                        }
                        break;
                    default:
                        searchValue = keyValue;
                }
            } catch (err) {
                node.error("Error processing keyValue: " + err.message);
                return;
            }

            var foundObject = array.find((obj) => {
                if (keyValueType === 'json' && typeof searchValue === 'object') {
                    // For objects/arrays, do deep comparison
                    return JSON.stringify(obj[key]) === JSON.stringify(searchValue);
                } else if (keyValueType === 'date' && obj[key] instanceof Date) {
                    // For dates, compare timestamps
                    return obj[key].getTime() === searchValue.getTime();
                } else {
                    // For primitives, use strict equality
                    return obj[key] === searchValue;
                }
            });

            msg.payload = foundObject || null;
            msg.array = array;

            node.send(msg);
        });
    }
    RED.nodes.registerType("find-object", FindObjectNode);
};
