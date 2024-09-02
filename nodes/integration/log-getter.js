const axios = require("axios");
const xml2js = require("xml2js");
const zlib = require("zlib");

module.exports = function (RED) {
    function LogGetterNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on("input", async function (msg, done) {
            const globalContext = node.context().global;
            let url =
                msg.req && msg.req.body && msg.req.body.logUrl !== undefined
                    ? msg.req.body.logUrl
                    : config.logUrl;
            let conceptName =
                msg.req &&
                msg.req.body &&
                msg.req.body.conceptName !== undefined
                    ? msg.req.body.conceptName
                    : config.conceptName;

            if (typeof url !== "string") {
                node.error("Payload must be a URL string");
                return;
            }
            if (typeof conceptName === "string") {
                globalContext.set("conceptName", conceptName);
            }

            try {
                axios.get(url, {
                    responseType: "arraybuffer",
                }); // This is just for BPM 2024
                const response = await axios.get(url, {
                    responseType: "arraybuffer",
                });
                const buffer = Buffer.from(response.data);

                // Check if the URL has a .json extension
                if (url.endsWith(".json")) {
                    // If it's a JSON file, parse directly as JSON
                    try {
                        const jsonResult = JSON.parse(buffer.toString("utf8"));
                        msg.log = jsonResult;
                        node.send(msg);
                        if (done) done();
                    } catch (jsonErr) {
                        node.error("Failed to parse JSON: " + jsonErr.message);
                        if (done) done(jsonErr);
                    }
                } else {
                    // Try to decompress if necessary
                    zlib.gunzip(buffer, (err, decompressedBuffer) => {
                        let dataString;

                        if (err) {
                            // If decompression fails, assume it's plain text
                            dataString = buffer.toString("utf8");
                        } else {
                            // Decompression succeeded, convert to string
                            dataString = decompressedBuffer.toString("utf8");
                        }

                        // Determine if data is XML or JSON
                        if (dataString.trim().startsWith("<")) {
                            // Parse as XML
                            xml2js.parseString(dataString, (err, result) => {
                                if (err) {
                                    node.error(
                                        "Failed to parse XML: " + err.message
                                    );
                                    if (done) done(err);
                                    return;
                                }
                                msg.log = result;
                                node.send(msg);
                                if (done) done();
                            });
                        } else {
                            // Attempt to parse as JSON
                            try {
                                const jsonResult = JSON.parse(dataString);
                                msg.log = jsonResult;
                                node.send(msg);
                                if (done) done();
                            } catch (jsonErr) {
                                node.error(
                                    "Failed to parse JSON: " + jsonErr.message
                                );
                                if (done) done(jsonErr);
                            }
                        }
                    });
                }
            } catch (error) {
                node.error("Failed to fetch the log: " + error.message);
                if (done) done(error);
            }
        });
    }

    RED.nodes.registerType("log-getter", LogGetterNode);
};
