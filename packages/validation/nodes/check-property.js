module.exports = function (RED) {
    function CheckPropertyNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        node.on("input", function (msg) {
            const propertyToCheck = msg.req && msg.req.body && msg.req.body.propertyToCheck !== undefined
                ? msg.req.body.propertyToCheck : config.propertyToCheck;

            const expectedValue = msg.req && msg.req.body && msg.req.body.expectedValue !== undefined 
                ? msg.req.body.expectedValue : config.expectedValue;
            if (
                msg.payload &&
                typeof msg.payload === "object" &&
                msg.payload.hasOwnProperty(propertyToCheck)
            ) {
                let propertyValue = msg.payload[propertyToCheck];
                let isMatching = propertyValue === expectedValue;
                msg.payload.result = isMatching;
                node.send(msg);

            } else if (msg.expectedValue && msg.parts && msg.array) {
                let index = msg.parts.index;
                let obj = msg.array[index];
                let propertyValue = obj[msg.propertyToCheck];
                let isMatching = propertyValue === msg.expectedValue;

                msg.payload.result = isMatching;
                node.send(msg);
            } else {
                msg.payload.result = false;
                node.send(msg);
            }
        });
    }

    RED.nodes.registerType("check-property", CheckPropertyNode);
};
