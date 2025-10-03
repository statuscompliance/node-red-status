const { addEvidence } = require('node-red-status-commons')

module.exports = function (RED) {
    function IsValidURL(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            let property = msg.req?.body?.property ?? config.property;
            const storeEvidences = config.storeEvidences;
            const urlPattern = new RegExp(
                "^(https?:\\/\\/)?" +
                    "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" +
                    "((\\d{1,3}\\.){3}\\d{1,3}))" +
                    "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" +
                    "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" +
                    "(\\#[-a-zA-Z\\d_]*)?$",
                "i"
            );
            let result = false;
            if (urlPattern.test(msg.payload[property])) {
                result = true;
            }
            msg.payload.result = result
            msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];

            addEvidence(msg, "url", msg.payload[property], result, storeEvidences);

            node.send(msg);
        });
    }
    RED.nodes.registerType("is-valid-url", IsValidURL);
};
