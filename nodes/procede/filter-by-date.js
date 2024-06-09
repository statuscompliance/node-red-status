module.exports = function (RED) {
    function FilterByDateNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            // Parse input parameters from config
            var attribute = msg.req.body.attribute || config.attribute;
            var startDate = new Date(
                msg.req.body.startDate || config.startDate
            );
            var endDate = new Date(msg.req.body.endDate || config.endDate);
            try {
                if (Array.isArray(msg.payload)) {
                    msg.payload.forEach(function (obj) {
                        var attributeValue = obj[attribute];
                        var documentDate = new Date(Date.parse(attributeValue)); // Convert value to Date object
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
                    var attributeValue = msg.payload[attribute];
                    // Convert the attribute value to a date object
                    var documentDate = new Date(Date.parse(attributeValue)); // Convert value to Date object
                    filterAndSend(
                        node,
                        msg,
                        documentDate,
                        startDate,
                        endDate,
                        obj
                    );
                }
            } catch (err) {
                node.error(err, msg); // Handle any errors that occur during processing
                msg.payload =
                    "Something went wrong while processing the message. Please check the logs for more details.";
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
            // Filter messages based on the date range
            if (documentDate >= startDate && documentDate <= endDate) {
                msg.payload = obj;
                node.send(msg); // Send the message if the document date is within the specified range
            }
        }
    }
    RED.nodes.registerType("filter-by-date", FilterByDateNode);
};
