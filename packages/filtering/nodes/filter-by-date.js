module.exports = function (RED) {
    function FilterByDateNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            // Parse input parameters from config
            let attribute = msg.req?.body?.attribute ?? config.attribute;
            let startDate = new Date(msg.req?.body?.startDate ?? config.startDate);
            let endDate = new Date(msg.req?.body?.endDate ?? config.endDate);
            try {
                if (Array.isArray(msg.payload)) {
                    msg.payload.forEach(function (obj) {
                        let attributeValue = obj[attribute];
                        let documentDate = new Date(Date.parse(attributeValue));
                        filterAndSend(
                            node,
                            msg,
                            documentDate,
                            startDate,
                            endDate,
                            obj
                        );
                    });
                } else {
                    let attributeValue = msg.payload[attribute];
                    let documentDate = new Date(Date.parse(attributeValue));
                    filterAndSend(
                        node,
                        msg,
                        documentDate,
                        startDate,
                        endDate,
                        msg.payload
                    );
                }
            } catch (err) {
                node.error(err, msg);
                node.send(msg);
            }
        });

        // Function to filter messages based on date range and send
        function filterAndSend(
            node,
            msg,
            documentDate,
            startDate,
            endDate,
            obj
        ) {
            if (documentDate >= startDate && documentDate <= endDate) {
                msg.payload = obj;
                node.send(msg);
            }
        }
    }
    RED.nodes.registerType("filter-by-date", FilterByDateNode);
};
