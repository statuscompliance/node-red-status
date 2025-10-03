const { v4: uuidv4 } = require('uuid');

function existSection(msg, storeEvidences, config, node) {
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

function extractTextFromPDF(pdfContent, node, msg, storeEvidences, pdfParse) {
    if (!pdfParse) {
        node.error("pdf-parse module not provided");
        msg.payload.result = false;
        addEvidence(msg, "PDF", "pdf-parse module not available", false, storeEvidences);
        node.send(msg);
        return;
    }
    
    pdfParse(pdfContent)
        .then((data) => {
            msg.payload.result = data.text;
            node.send(msg);
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

function addEvidence(msg, key, value, result, storeEvidences) {
    if (storeEvidences) {
        msg.payload.evidences.push({
            id: uuidv4(),
            key,
            value,
            result
        });
    }
}

module.exports = {
    existSection,
    extractTextFromPDF,
    addEvidence
};