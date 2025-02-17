const axios = require("axios");

module.exports = function (RED) {
    function StatusStorerNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        let backendUrl = config.backendUrl ?? "http://status-backend:3001/api/computations";
        let accessToken = config.accessToken ?? '';
        let bufferSize = parseInt(config.bufferSize ?? 2);
        let flushInterval = parseInt(config.flushInterval ?? 3000);
        
        let buffer = [];
        let totalPayloadsSent = 0;
        let lastMessage = null;

        async function sendToBackend(msg, isFinal = false) {
            if (buffer.length === 0) return;
            isFinal = msg.size === (totalPayloadsSent + buffer.length);
            const payloadToSend = {
                computations: buffer.slice(),
                done: isFinal,
            };
            buffer = [];

            try {
                totalPayloadsSent += payloadToSend.computations.length;
                await axios.post(
                    backendUrl,
                    JSON.stringify(payloadToSend),
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-access-token": accessToken
                        },
                        withCredentials: true,
                    }
                );
                totalPayloadsSent += payloadToSend.computations.length;
                lastMessage = msg ?? lastMessage;
                if (isFinal) {
                    totalPayloadsSent = 0;
                    lastMessage.payload = {
                        message: "Computations succesfully stored",
                    };
                    node.send(lastMessage);
                }
                
            } catch (error) {
                node.error("Error while sending payload to backend" + error);
                msg.payload = {
                    message: "Error while sending payload to backend",
                    error: error,
                };
                node.send(msg);
            }
        }

        function addToBuffer(msg) {
            buffer.push(msg.payload);
            if (buffer.length >= bufferSize) {
                sendToBackend(msg, false);
            }
        }

        node.on("input", function (msg) {
            const {
                from = config.from,
                to = config.to,
                controlId =  config.controlId,
              } = msg.req?.body || {};
            backendUrl = (msg.req?.body?.backendUrl || config.backendUrl) ?? "http://status-backend:3001/api/computations";
            accessToken = (msg.req?.headers['x-access-token'] || msg.req?.cookies?.accessToken) ?? config.accessToken;
            bufferSize = parseInt(msg.req?.body?.bufferSize ?? 2);
            flushInterval = parseInt(msg.req?.body?.flushInterval ?? 2000);
            let computationGroup = msg.req?.body?.computationGroup ?? '';
            
            const { result: value, scope, evidences } = msg.payload;
            msg.payload = {
                computationGroup: computationGroup,
                period: {
                    from,
                    to
                },
                controlId: controlId,
                value,
                scope,
                evidences
            };
            addToBuffer(msg);
        });

        const intervalId = setInterval(() => sendToBackend, flushInterval);

        node.on("close", function () {
            clearInterval(intervalId);
        });
    }

    RED.nodes.registerType("status-storer", StatusStorerNode);
};
