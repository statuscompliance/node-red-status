const Fuse = require("fuse.js");
const { v4: uuidv4 } = require('uuid');

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
            let conceptName = msg.req?.body?.conceptName ?? config.conceptName;
            let attribute = msg.req?.body?.attribute ?? config.attribute;
            let value = msg.req?.body?.value ?? config.value;
            const storeEvidences = config.storeEvidences;
            let data = (msg.payload.trace && msg.payload.trace.event) || msg.payload.event || msg.payload.events || msg.payload || [];

            if (!Array.isArray(data)) {
                node.error("Invalid data format. Expected an array in trace.event or events.");
                msg.payload.result = false;
                return node.send(msg);
            }

            let searchableList = flattenData(data, attribute);

            const fuse = new Fuse(searchableList, {
                keys: value? [value]: ["value"],
                includeScore: true,
                threshold: 0.3,
            });

            const result = fuse.search(conceptName);

            msg.payload.result = result.length > 0;
            msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];
            if(storeEvidences){
                msg.payload.evidences.push({
                    id: uuidv4(),
                    key: conceptName,
                    value: result.map((item) => item.item),
                    result: result.length > 0,
                });
            }
            node.send(msg);
        });
    }

    RED.nodes.registerType("has-activity", CheckConceptNameNode);
};
