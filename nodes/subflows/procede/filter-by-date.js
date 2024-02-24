const fs = require("fs");
const path = require("path");

module.exports = function (RED) {
    registerSubflow(RED, "filter-by-date", "filter-by-date.json");
}

function registerSubflow(RED, subflowName, subflowPath) {
    const subflowFile = path.join(__dirname, subflowPath);
    try {
        const subflowContents = fs.readFileSync(subflowFile);
        const subflowJSON = JSON.parse(subflowContents);
        RED.nodes.registerSubflow(subflowJSON);
        console.log(`Subflujo "${subflowName}" registrado con éxito.`);
    } catch (error) {
        console.error(`Error al leer o parsear el archivo ${subflowFile}:`, error);
    }
}