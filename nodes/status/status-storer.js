module.exports = function (RED) {
    function StatusStorerNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        let buffer = [];
        let backendUrl =
            config.backendUrl || "http://localhost:3001/api/computations";
        let accessToken = config.accessToken || "secret";
        let bufferSize = parseInt(config.bufferSize) || 10;
        let flushInterval = parseInt(config.flushInterval) || 5000;

        async function sendToBackend() {
            if (buffer.length === 0) return;

            const payloadToSend = buffer.slice();
            buffer = [];

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                },
                body: JSON.stringify(payloadToSend),
            };

            try {
                const response = await fetch(backendUrl, options);
                if (!response.ok) {
                    const body = await response.text();
                    node.error("Error en la respuesta del backend: " + body);
                } else {
                    node.log(
                        "Paquete enviado correctamente: " +
                            JSON.stringify(payloadToSend)
                    );
                }
            } catch (error) {
                node.error("Error al enviar al backend: " + error);
            }
        }

        function addToBuffer(msg) {
            buffer.push(msg.payload);

            if (buffer.length >= bufferSize) {
                sendToBackend();
            }
        }

        node.on("input", function (msg) {
            backendUrl =
                msg.req && msg.req.body && msg.req.body.backendUrl !== undefined
                    ? msg.req.body.backendUrl
                    : config.backendUrl;

            accessToken =
                msg.req &&
                msg.req.body &&
                msg.req.body.accessToken !== undefined
                    ? msg.req.body.accessToken
                    : config.accessToken;

            bufferSize =
                msg.req && msg.req.body && msg.req.body.bufferSize !== undefined
                    ? msg.req.body.bufferSize
                    : config.bufferSize;
            bufferSize = parseInt(bufferSize) || 10;

            flushInterval =
                msg.req &&
                msg.req.body &&
                msg.req.body.flushInterval !== undefined
                    ? msg.req.body.flushInterval
                    : config.flushInterval;
            flushInterval = parseInt(flushInterval) || 5000;

            addToBuffer(msg);
        });

        const intervalId = setInterval(sendToBackend, flushInterval);

        node.on("close", function () {
            clearInterval(intervalId);
            sendToBackend();
        });
    }

    RED.nodes.registerType("status-storer", StatusStorerNode);
};
