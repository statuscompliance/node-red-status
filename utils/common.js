const pdfParse = require("pdf-parse");

export function addEvidence(msg, key, value, result, storeEvidences) {
    if (storeEvidences) {
        msg.payload.evidences.push({
            id: uuidv4(),
            key,
            value,
            result
        });
    }
}

export function existSection(msg, storeEvidences) {
    let data = msg.payload.result;
    let section = msg.req?.body?.section ?? config.section;
    const result = data.includes(section).toString();
    msg.payload.result = result;
    const evidence = {
        section: section,
        data: data,
    }
    addEvidence(msg, "Section", evidence, result, storeEvidences);
    node.send(msg);
}

export function extractTextFromPDF(url, node, msg, storeEvidences) {
    pdfParse(url)
        .then((data) => {
            msg.payload.result = data.text;
            existSection(msg);
        })
        .catch((error) => {
            node.error(
                "Error extracting text from PDF: " + error.message
            );
            msg.payload.result = false;
            addEvidence(msg, "PDF", "Error extracting text from PDF", false, storeEvidences);
            node.send(msg);
        });
}
