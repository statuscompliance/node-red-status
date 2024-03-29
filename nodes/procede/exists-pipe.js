// Importa el módulo de Node-RED
module.exports = function(RED) {
    // La función del nodo
    function ExistsPipeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // Configura el nodo para que reciba el parámetro "count"
        this.count = config.count;
        // Cuando llegue un mensaje al nodo
        this.on('input', function(msg) {
            
            // Obtiene los datos del flujo
            var flowData = msg.payload;
            // Comprueba si el número de documentos coincide con el valor esperado
            msg.payload = Object.keys(flowData).length == this.count;
            node.warn('flowData: ' + JSON.stringify(flowData))
            node.warn('count: ' + this.count)
            // Envía el mensaje modificado
            node.send(msg);
        });
    }
    // Registra el nodo personalizado en Node-RED
    RED.nodes.registerType("exists-pipe", ExistsPipeNode);
}
