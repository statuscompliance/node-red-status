const axios = require("axios");

module.exports = function (RED) {
    function StatusStorerNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        let backendUrl =
            config.backendUrl !== undefined
                ? config.backendUrl
                : "http://status-backend:3001/api/computations";

        let accessToken =
            config.accessToken !== undefined
                ? config.accessToken
                : config.accessToken;

        let bufferSize =
            config.bufferSize !== undefined ? parseInt(config.bufferSize) : 2;

        let flushInterval =
            config.flushInterval !== undefined
                ? parseInt(config.flushInterval)
                : 3000;

        let buffer = [];
        let totalPayloadsSent = 0;
        let lastMessage = null;

        async function sendToBackend(msg) {
            if (buffer.length === 0) return;

            const payloadToSend = buffer.slice();
            buffer = [];

            try {
                const response = await axios.post(
                    backendUrl,
                    JSON.stringify(payloadToSend),
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + accessToken,
                        },
                    }
                );
                totalPayloadsSent += payloadToSend.length;
                lastMessage = msg ? msg : lastMessage;
                if (lastMessage) {
                    if (lastMessage.size === totalPayloadsSent) {
                        totalPayloadsSent = 0;
                        lastMessage.payload = {
                            message: "Computations succesfully stored",
                        };
                        node.send(lastMessage);
                    }
                }
            } catch (error) {
                node.error("Error while sending payload to backend" + error);
            }
        }

        function addToBuffer(msg, bufferSize) {
            let lastResponse = null;
            buffer.push(msg.payload);

            if (buffer.length >= bufferSize) {
                lastResponse = sendToBackend(msg);
            }
        }

        node.on("input", function (msg) {
            backendUrl =
                msg.req && msg.req.body && msg.req.body.backendUrl !== undefined
                    ? msg.req.body.backendUrl
                    : "http://status-backend:3001/api/computations";

            accessToken =
                msg.req &&
                msg.req.body &&
                msg.req.body.accessToken !== undefined
                    ? msg.req.body.accessToken
                    : config.accessToken;

            bufferSize =
                msg.req && msg.req.body && msg.req.body.bufferSize !== undefined
                    ? parseInt(msg.req.body.bufferSize)
                    : 2;

            flushInterval =
                msg.req &&
                msg.req.body &&
                msg.req.body.flushInterval !== undefined
                    ? parseInt(msg.req.body.flushInterval)
                    : 2000;

            addToBuffer(msg, bufferSize);
        });

        const intervalId = setInterval(sendToBackend, flushInterval);

        node.on("close", function () {
            clearInterval(intervalId);
            sendToBackend();
        });
    }

    RED.nodes.registerType("status-storer", StatusStorerNode);
};
