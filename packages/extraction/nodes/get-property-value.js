module.exports = function (RED) {
    const axios = require('axios');
    
    function GetPropertyValueNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", async function (msg) {
            var obj = msg.payload || null;
            
            if (config.enablePCM) {
                let mlUrl = msg.req?.body?.mlUrl ?? config.mlUrl;
                let mlEndpoint = msg.req?.body?.mlEndpoint ?? config.mlEndpoint;
                
                if (!mlUrl || !mlEndpoint) {
                    node.error("ML URL and ML Endpoint must be defined when PCM is enabled");
                    return;
                }
                
                try {
                    const fullUrl = mlUrl.endsWith('/') ? mlUrl + mlEndpoint.substring(1) : mlUrl + mlEndpoint;
                    
                    const response = await axios.post(fullUrl, obj, {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: 10000
                    });
                    
                    if (response.data && response.data.prediction !== undefined) {
                        msg.value = response.data.prediction;
                    } else {
                        node.warn("ML service response does not contain 'prediction' property");
                        msg.value = null;
                    }
                    
                    msg.payload = msg.array;
                    node.send(msg);
                    
                } catch (error) {
                    node.error("Error calling ML service: " + error.message);
                    msg.value = null;
                    msg.payload = msg.array;
                    node.send(msg);
                }
            } else {
                let propertyToGet = msg.req?.body?.propertyToGet ?? config.propertyToGet;
                msg.payload = msg.array;

                if (typeof obj !== "object" || obj === null) {
                    msg.value = null;
                    node.send(msg);
                } else {
                    if (!propertyToGet) {
                        node.error("Key must be defined");
                        return;
                    }
                    var value = obj[propertyToGet] || obj.propertyToGet;
                    msg.value = value !== undefined ? value : null;
                    node.send(msg);
                }
            }
        });
    }
    RED.nodes.registerType("get-property-value", GetPropertyValueNode);
};
