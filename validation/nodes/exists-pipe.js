// Importa el módulo de Node-RED
module.exports = function (RED) {
    // La función del nodo
    function ExistsPipeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // Configura el nodo para que reciba el parámetro "count"
        // Cuando llegue un mensaje al nodo
        node.on("input", function (msg) {
            var count = msg.req.body.count || config.count;
            // Obtiene los datos del flujo
            var flowData = msg.payload;
            // Comprueba si el número de documentos coincide con el valor esperado
            msg.payload = {
                result: Object.keys(flowData).length == count,
            };

            node.send(msg);
        });
    }
    // Registra el nodo personalizado en Node-RED
    RED.nodes.registerType("exists-pipe", ExistsPipeNode);
};
