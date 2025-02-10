module.exports = function (RED) {
    function LastTimestampNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            let data = msg.req?.body?.data ?? config.data;
            let timestampProperty = msg.req?.body?.timestampProperty ?? config.timestampProperty;
            let position = msg.req?.body?.position ?? config.position;
            
            try {
                let flattenedData = flattenData(data, timestampProperty);
                let latestTimestamp = null;
                
                flattenedData.forEach((item) => {
                    let timestamp = new Date(item[timestampProperty]);
                    if (!latestTimestamp || timestamp > latestTimestamp) {
                        latestTimestamp = timestamp;
                    }
                });
                
                msg.position = position;
                msg.payload.time = latestTimestamp ? latestTimestamp.getTime() : null;
                node.send(msg);
            } catch (err) {
                node.error("Error processing data: " + err.message);
            }
        });
    }

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

    RED.nodes.registerType("last-timestamp", LastTimestampNode);
};
