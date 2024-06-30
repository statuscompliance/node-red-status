const axios = require("axios");
const xml2js = require("xml2js");
const zlib = require("zlib");

module.exports = function (RED) {
    function LogGetterNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on("input", async function (msg, send, done) {
            const globalContext = node.context().global;
            const url = msg.req.body.logUrl || config.logUrl;
            const conceptName = msg.req.body.conceptName || config.conceptName;

            if (typeof url !== "string") {
                node.error("Payload must be a URL string");
                return;
            }
            if (typeof conceptName === "string") {
                globalContext.set("conceptName", conceptName);
            }

            try {
                const response = await axios.get(url, {
                    responseType: "arraybuffer",
                });
                const buffer = Buffer.from(response.data);

                // Try to decompress if necessary
                zlib.gunzip(buffer, (err, decompressedBuffer) => {
                    let xml;

                    if (err) {
                        // If decompression fails, assume it's plain text
                        xml = buffer.toString("utf8");
                    } else {
                        // Decompression succeeded, convert to string
                        xml = decompressedBuffer.toString("utf8");
                    }

                    xml2js.parseString(xml, (err, result) => {
                        if (err) {
                            node.error("Failed to parse XML: " + err.message);
                            if (done) done(err);
                            return;
                        }
                        msg.payload = result;
                        send(msg);
                        if (done) done();
                    });
                });
            } catch (error) {
                node.error("Failed to fetch the XES log: " + error.message);
                if (done) done(error);
            }
        });
    }

    RED.nodes.registerType("log-getter", LogGetterNode);
};
