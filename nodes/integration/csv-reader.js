const fs = require("fs");
const readline = require("readline");
const path = require("path");

module.exports = function (RED) {
    function CsvReaderNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on("input", function (msg) {
            const filePath =
                msg.req && msg.req.body && msg.req.body.path !== undefined
                    ? msg.req.body.path
                    : config.path;

            if (!filePath) {
                node.error("No file path specified");
                return;
            }

            // countLines(filePath)
            //     .then((lineCount) => {
            //         msg.len = lineCount;
            //     })
            //     .catch((err) => {
            //         console.error(
            //             "Error al contar las líneas del archivo:",
            //             err
            //         );
            //         this.error(err, msg);
            //     });

            const rl = readline.createInterface({
                input: fs.createReadStream(filePath),
                crlfDelay: Infinity,
            });

            let header;
            let index = 0;

            rl.on("line", (line) => {
                if (!header) {
                    header = line.split(",");
                    return;
                }

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
                msg.index = index++;
                msg.payload = lineObject;
                node.send(msg);
            });

            rl.on("close", () => {
                msg.complete = true;
                node.send(msg);
            });

            rl.on("error", (err) => {
                node.error(err);
            });
        });

        // async function countLines(filePath) {
        //     const fileStream = fs.createReadStream(filePath);
        //     const rl = readline.createInterface({
        //         input: fileStream,
        //         crlfDelay: Infinity,
        //     });

        //     let lineCount = 0;
        //     let secondLineLength = 0;
        //     let isFirstLine = true;

        //     for await (const line of rl) {
        //         lineCount++;
        //         if (isFirstLine) {
        //             isFirstLine = false;
        //             secondLineLength = Buffer.byteLength(line); // Obtener la longitud de la segunda línea en bytes
        //         }
        //     }

        //     // Ajustar el tamaño del buffer basado en la longitud de la segunda línea
        //     const bufferSize = secondLineLength || 64 * 1024; // Usar 64 KB si no se pudo obtener la longitud de la segunda línea

        //     return await countLinesWithBuffer(filePath, bufferSize);
        // }

        // function countLinesWithBuffer(filePath, bufferSize) {
        //     return new Promise((resolve, reject) => {
        //         let lineCount = 0;
        //         const buffer = Buffer.alloc(bufferSize);
        //         const fileDescriptor = fs.openSync(filePath, "r");
        //         let bytesRead = 0;
        //         let previousBufferEndsWithNewLine = false;

        //         try {
        //             while (
        //                 (bytesRead = fs.readSync(
        //                     fileDescriptor,
        //                     buffer,
        //                     0,
        //                     bufferSize,
        //                     null
        //                 )) !== 0
        //             ) {
        //                 for (let i = 0; i < bytesRead; i++) {
        //                     if (buffer[i] === 10) {
        //                         // 10 is ASCII code for newline ('\n')
        //                         lineCount++;
        //                     }
        //                 }
        //                 previousBufferEndsWithNewLine =
        //                     buffer[bytesRead - 1] === 10;
        //             }

        //             fs.closeSync(fileDescriptor);

        //             // If the last chunk ended with a newline, we've over-counted by one
        //             if (previousBufferEndsWithNewLine) {
        //                 lineCount--;
        //             }

        //             resolve(lineCount);
        //         } catch (err) {
        //             reject(err);
        //         }
        //     });
        // }
    }

    RED.nodes.registerType("csv-reader", CsvReaderNode);
};
