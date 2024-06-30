const fs = require("fs");
const readline = require("readline");
const path = require("path");

module.exports = function (RED) {
    function CsvChunkReaderNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on("input", function (msg) {
            const filePath = config.path || msg.req.body.path;
            const linesPerChunk = config.linesPerChunk || 1000;

            if (!filePath) {
                node.error("No file path specified");
                return;
            }

            const rl = readline.createInterface({
                input: fs.createReadStream(filePath),
                crlfDelay: Infinity,
            });

            let header;
            let lines = [];
            let lineCount = 0;
            let fileCount = 0;

            rl.on("line", (line) => {
                if (!header) {
                    header = line.split(",");
                    return;
                }

                // const lineData = line.split(",");

                // // Remove surrounding quotes from each value
                // const lineObject = {};
                // header.forEach((key, index) => {
                //     let value = lineData[index].trim(); // Trim whitespace
                //     value = value.replace(/^\\?"\s*(.*?)\s*"\\?$/, '$1');
                //     key = key.replace(/^\\?"\s*(.*?)\s*"\\?$/, '$1');
                //     lineObject[key.trim()] = value;
                // });

                const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;

                // Dividir la línea en datos utilizando la expresión regular
                const lineData = line.split(regex);

                // Objeto donde se almacenarán los datos parseados
                const lineObject = {};

                // Iterar sobre cada encabezado y asignar el valor correspondiente del lineData
                header.forEach((key, index) => {
                    let value = lineData[index].trim(); // Eliminar espacios en blanco alrededor

                    // Si el valor está entre comillas dobles, eliminar las comillas
                    if (value.match(/^"(.*)"$/)) {
                        value = value.replace(/^"(.*)"$/, "$1");
                    }

                    if (key.match(/^"(.*)"$/)) {
                        key = key.replace(/^"(.*)"$/, "$1");
                    }

                    // Asignar el valor al objeto usando el encabezado como clave
                    lineObject[key.trim()] = value;
                });

                lines.push(lineObject);
                lineCount++;

                if (lineCount % linesPerChunk === 0) {
                    const chunkFilePath = path.join(
                        __dirname,
                        `chunk_${fileCount}.json`
                    );
                    fs.writeFileSync(chunkFilePath, JSON.stringify(lines));
                    // node.warn(
                    //     `File size: ${
                    //         fs.statSync(chunkFilePath).size / 1024 / 1024
                    //     } MB`
                    // );
                    // Send the chunk as a separate message
                    msg.payload = lines;
                    msg.chunkFilePath = chunkFilePath;

                    node.send(msg);
                    lines = [];
                    fileCount++;
                }
            });

            rl.on("close", () => {
                if (lines.length > 0) {
                    const chunkFilePath = path.join(
                        __dirname,
                        `chunk_${fileCount}.json`
                    );
                    fs.writeFileSync(chunkFilePath, JSON.stringify(lines));
                    // Send the remaining chunk as a separate message
                    msg.payload = lines;
                    msg.chunkFilePath = chunkFilePath;

                    node.send(msg);
                }
            });

            rl.on("error", (err) => {
                node.error(err);
            });
        });
    }

    RED.nodes.registerType("csv-chunk-reader", CsvChunkReaderNode);
};
