module.exports = function (RED) {
    function GroupByPropertyNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        let groups = {};
        let ac = 0;
        node.on("input", function (msg) {
            let property = msg.req?.body?.property ?? config.property;
            if (!property) {
                node.error("No property specified to group by.");
                return;
            }
            let payload = msg.payload;
            if (payload && payload[property]) {
                let key = payload[property];
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(payload);
                ac++;
            }
            if (ac === msg.len-1) {
                msg.payload = groups;
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("group-by", GroupByPropertyNode);
};
