const { v4: uuidv4 } = require("uuid");

module.exports = function (RED) {
    function ExistsPipeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        node.on("input", function (msg) {
            let count = msg.req?.body?.count ?? config.count
            let flowData = (msg.payload.trace && msg.payload.trace.event) || msg.payload.event || msg.payload.events || msg.payload; 
            const storeEvidences = config.storeEvidences;
            msg.payload.result =  Object.keys(flowData).length == count;
            msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];
            if(storeEvidences){
                msg.payload.evidences.push({
                    id: uuidv4(),
                    name: "Count",
                    value: {
                        expected: count,
                        actual: Object.keys(flowData).length,
                    },
                    result: msg.payload.result,
                });
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("exists-pipe", ExistsPipeNode);
};
