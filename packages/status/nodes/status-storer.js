const axios = require("axios");

module.exports = function (RED) {
    function StatusStorerNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        // --- Node Configuration ---
        let backendUrl = config.backendUrl || "http://status-backend:3001/api/v1/computations/bulk";
        let accessToken = config.accessToken || '';
        let bufferSize = parseInt(config.bufferSize || 2);
        let flushInterval = parseInt(config.flushInterval || 2000);

        // Default properties for a computation group, if not provided per message.
        let defaultComputationGroup = config.computationGroup || '';
        let defaultFrom = config.from || null;
        let defaultTo = config.to || null;
        let defaultControlId = config.controlId || null;

        // --- Node State Variables ---
        let buffer = [];
        let totalPayloadsSentInSequence = 0;
        let lastMessageReceived = null;
        let currentIntervalId = null;

        // --- Helper Functions ---

        const startFlushInterval = () => {
            if (currentIntervalId) {
                clearInterval(currentIntervalId);
            }
            currentIntervalId = setInterval(() => {
                if (buffer.length > 0) {
                    node.warn(`[StatusStorer] Flush interval triggered. Sending ${buffer.length} remaining items.`);
                    // Force 'done: true' for interval-triggered flushes.
                    sendToBackend(lastMessageReceived || {}, true);
                }
            }, flushInterval);
        };

        /**
         * Sends buffered items to the backend.
         * @param {Object} msg - The last Node-RED message for output context.
         * @param {boolean} forceFinal - If the 'done' flag should be forced to true for this request.
         */
        async function sendToBackend(msg, forceFinal = false) {
            if (buffer.length === 0) {
                node.status({ fill: "grey", shape: "dot", text: "Buffer empty, no send." });
                return;
            }

            const payloadsToProcess = buffer.slice();
            buffer = []; // Clear buffer immediately

            let currentIsFinal = forceFinal;
            // Determine if this is the final batch based on msg.parts.count, if not forced final.
            if (msg && typeof msg.parts?.count === 'number' && !forceFinal) {
                currentIsFinal = (totalPayloadsSentInSequence + payloadsToProcess.length) >= msg.parts.count;
            }

            const payloadToSend = {
                computations: payloadsToProcess,
                done: currentIsFinal,
            };

            try {
                node.status({ fill: "yellow", shape: "dot", text: `Sending ${payloadToSend.computations.length} items...` });
                node.debug(`[StatusStorer] Sending payload to ${backendUrl}: ${JSON.stringify(payloadToSend, null, 2)}`);

                const response = await axios.post(
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

                totalPayloadsSentInSequence += payloadToSend.computations.length;
                node.status({ fill: "green", shape: "dot", text: `Sent ${payloadToSend.computations.length} items. Total: ${totalPayloadsSentInSequence}` });
                node.debug(`[StatusStorer] Backend response status: ${response.status}`);

                // If this batch marks the end of the sequence
                if (currentIsFinal) {
                    node.status({ fill: "blue", shape: "dot", text: `Completed. Final total: ${totalPayloadsSentInSequence}` });
                    totalPayloadsSentInSequence = 0; // Reset for the next sequence

                    if (lastMessageReceived) {
                        lastMessageReceived.payload = {
                            message: "Computations successfully stored",
                            details: response.data // Include backend response
                        };
                        node.send(lastMessageReceived); // Send success message
                    }
                    lastMessageReceived = null; // Clear for next sequence
                } else {
                    if (msg) {
                        lastMessageReceived = msg; // Update lastMessageReceived only if msg is valid
                    }
                }

            } catch (error) {
                node.status({ fill: "red", shape: "dot", text: `Error: ${error.message}` });
                let errorMessage = `[StatusStorer] Error sending payload to backend: ${error.message}`;

                if (error.response) {
                    errorMessage += `\nBackend Status: ${error.response.status}`;
                    errorMessage += `\nBackend Data: ${JSON.stringify(error.response.data)}`;
                } else if (error.request) {
                    errorMessage += "\nNo response received from backend (request made).";
                } else {
                    errorMessage += "\nError setting up request.";
                }

                node.error(errorMessage, msg);

                // Send error message through node's output
                if (msg) {
                    msg.payload = {
                        message: "Error while sending payload to backend",
                        error: errorMessage,
                    };
                    node.send(msg);
                } else {
                    node.send({ payload: { message: "Error in background send", error: errorMessage } });
                }
            }
        }

        /**
         * Adds an individual computation message to the buffer.
         * @param {Object} msg - Node-RED message with individual computation in msg.payload.
         */
        function addToBuffer(msg) {
            const incomingComputation = msg.payload;
            const formattedComputation = { ...incomingComputation };

            // Apply global computationGroup if not present in individual payload
            if (!formattedComputation.computationGroup) {
                let currentComputationGroup = msg.req?.body?.computationGroup ?? defaultComputationGroup;
                if (currentComputationGroup) {
                    formattedComputation.computationGroup = currentComputationGroup;
                }
            }

            // Apply default period if not present in payload
            if (!formattedComputation.period) formattedComputation.period = {};
            if (!formattedComputation.period.from && defaultFrom) formattedComputation.period.from = defaultFrom;
            if (!formattedComputation.period.to && defaultTo) formattedComputation.period.to = defaultTo;

            // Apply default controlId if not present in payload
            if (formattedComputation.controlId === undefined && defaultControlId !== null) {
                formattedComputation.controlId = defaultControlId;
            }

            buffer.push(formattedComputation);
            node.status({ fill: "yellow", shape: "dot", text: `Buffering: ${buffer.length}/${bufferSize}` });
            node.debug(`[StatusStorer] Added to buffer: ${JSON.stringify(formattedComputation)}`);

            // If buffer is full, trigger send.
            if (buffer.length >= bufferSize) {
                node.debug(`[StatusStorer] Buffer full (${buffer.length}/${bufferSize}). Triggering send.`);
                sendToBackend(msg, false);
            }
        }

        // --- Node Event Handlers ---
        node.on("input", function (msg) {
            backendUrl = msg.req?.body?.backendUrl ?? config.backendUrl ?? "http://status-backend:3001/api/v1/computations/bulk";
            accessToken = msg.req?.headers?.['x-access-token'] ?? msg.req?.cookies?.accessToken ?? config.accessToken;

            const newBufferSize = parseInt(msg.req?.body?.bufferSize ?? config.bufferSize ?? 2);
            if (newBufferSize !== bufferSize) {
                bufferSize = newBufferSize;
                node.warn(`[StatusStorer] Buffer size changed to: ${bufferSize}`);
            }

            const newFlushInterval = parseInt(msg.req?.body?.flushInterval ?? config.flushInterval ?? 2000);
            if (newFlushInterval !== flushInterval) {
                flushInterval = newFlushInterval;
                startFlushInterval();
                node.warn(`[StatusStorer] Flush interval changed to: ${flushInterval}ms`);
            }
            
            defaultComputationGroup = msg.req?.body?.computationGroup ?? config.computationGroup ?? '';
            defaultFrom = msg.req?.body?.from ?? config.from ?? null;
            defaultTo = msg.req?.body?.to ?? config.to ?? null;
            defaultControlId = msg.req?.body?.controlId ?? config.controlId ?? null;
            
            lastMessageReceived = msg;
            addToBuffer(msg);
        });

        startFlushInterval();
        node.status({ fill: "grey", shape: "ring", text: "Initialized and ready." });

        node.on("close", async function (done) {
            clearInterval(currentIntervalId);
            node.status({ fill: "blue", shape: "ring", text: "Closing..." });

            if (buffer.length > 0) {
                node.warn(`[StatusStorer] Node closing. Sending ${buffer.length} remaining buffered items.`);
                try {
                    await sendToBackend(lastMessageReceived || {}, true);
                    node.status({ fill: "blue", shape: "dot", text: "Buffer flushed on close." });
                } catch (error) {
                    node.error(`[StatusStorer] Failed to flush buffer on close: ${error.message}`);
                    node.status({ fill: "red", shape: "dot", text: "Error on close flush." });
                }
            }
            done();
        });
    }

    RED.nodes.registerType("status-storer", StatusStorerNode);
};
