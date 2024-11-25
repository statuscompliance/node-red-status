const Fuse = require("fuse.js");

module.exports = function (RED) {
    function CheckConceptNameNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;


        function flattenData(data, attribute, result = []) {
            if (Array.isArray(data)) {
                data.forEach((item) => flattenData(item, attribute, result));
            } else if (data && typeof data === "object") {
                if (data[attribute] !== undefined || Object.values(data).includes(attribute)) {
                    result.push(data);
                } else {
                    Object.values(data).forEach((value) => flattenData(value, attribute, result));
                }
            }
            return result;
        }

        node.on("input", async function (msg) {
            let conceptName =
                msg.req &&
                msg.req.body &&
                msg.req.body.conceptName !== undefined
                    ? msg.req.body.conceptName
                    : config.conceptName;

            let attribute =
                msg.req &&
                msg.req.body &&
                msg.req.body.attribute !== undefined
                    ? msg.req.body.attribute
                    : config.attribute;
            
            let value = msg.req &&
                msg.req.body &&
                msg.req.body.value !== undefined
                    ? msg.req.body.value
                    : config.value;

            let data = (msg.payload.trace && msg.payload.trace.event) || msg.payload.events || msg.payload || [];

            if (!Array.isArray(data)) {
                node.error("Invalid data format. Expected an array in trace.event or events.");
                msg.payload.result = false;
                return node.send(msg);
            }

            let searchableList = flattenData(data, attribute);

            const fuse = new Fuse(searchableList, {
                keys: value? [value]: [attribute],
                includeScore: true,
                threshold: 0.3,
            });

            const result = fuse.search(conceptName);

            msg.payload.result = result.length > 0;
            msg.payload.match = result.map((item) => item.item);
            node.send(msg);
        });
    }

    RED.nodes.registerType("has-activity", CheckConceptNameNode);
};
