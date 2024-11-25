module.exports = function (RED) {
    function ExistsPipeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        node.on("input", function (msg) {
            var count = msg.req && msg.req.body && msg.req.body.count !== undefined ? msg.req.body.count : config.count;

            var flowData = msg.payload;
            msg.payload = {
                result: Object.keys(flowData).length == count,
            };

            node.send(msg);
        });
    }
    RED.nodes.registerType("exists-pipe", ExistsPipeNode);
};
