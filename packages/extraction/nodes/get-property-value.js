module.exports = function (RED) {
    function GetPropertyValueNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Evento al recibir un mensaje
        node.on("input", function (msg) {
            var obj = msg.payload || null;
            let propertyToGet = msg.req?.body?.propertyToGet ?? config.propertyToGet;
            msg.payload = msg.array;

            if (typeof obj !== "object" || obj === null) {
                msg.value = null;
                node.send(msg);
            } else {
                if (!propertyToGet) {
                    node.error("Key must be defined");
                    return;
                }
                var value = obj[propertyToGet] || obj.propertyToGet;
                msg.value = value !== undefined ? value : null;
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("get-property-value", GetPropertyValueNode);
};
