module.exports = function (RED) {
    function GroupByPropertyNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            let property =
                msg.req && msg.req.body && msg.req.body.property !== undefined
                    ? msg.req.body.property
                    : config.property;
            if (!property) {
                node.error("No property specified to group by.");
                return;
            }

            let groupedByProperty = msg.payload.reduce((acc, item) => {
                let propKey = item[property];
                if (!acc[propKey]) {
                    acc[propKey] = [];
                }
                acc[propKey].push(item);
                return acc;
            }, {});
            msg.items = Object.keys(groupedByProperty);
            msg.payload = groupedByProperty;
            node.send(msg);
        });
    }
    RED.nodes.registerType("group-by", GroupByPropertyNode);
};
