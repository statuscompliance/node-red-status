module.exports = function (RED) {
    function IsValidURL(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            var property =
                msg.req && msg.req.body && msg.req.body.property !== undefined
                    ? msg.req.body.property
                    : config.property;

            const urlPattern = new RegExp(
                "^(https?:\\/\\/)?" +
                    "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" +
                    "((\\d{1,3}\\.){3}\\d{1,3}))" +
                    "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" +
                    "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" +
                    "(\\#[-a-zA-Z\\d_]*)?$",
                "i"
            );

            if (urlPattern.test(msg.payload[property])) {
                msg.payload.result = true;
            } else {
                msg.payload.result = false;
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("is-valid-url", IsValidURL);
};
