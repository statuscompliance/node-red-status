let uuidv4 = null;

// Función para inicializar uuid de forma asíncrona
async function initUuid() {
    if (!uuidv4) {
        const uuid = await import('uuid');
        uuidv4 = uuid.v4;
    }
    return uuidv4;
}

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

async function extractTextFromPDF(pdfContent, node, msg, storeEvidences, pdfParse) {
    if (!pdfParse) {
        node.error("pdf-parse module not provided");
        msg.payload.result = false;
        addEvidence(msg, "PDF", "pdf-parse module not available", false, storeEvidences);
        node.send(msg);
        return;
    }
    
    try {
        const data = await pdfParse(pdfContent);
        msg.payload.result = data.text;
        node.send(msg);
    } catch (error) {
        node.error(
            "Error extracting text from PDF: " + error.message
        );
        msg.payload.result = false;
        addEvidence(msg, "PDF", "Error extracting text from PDF", false, storeEvidences);
        node.send(msg);
    }
}

async function addEvidence(msg, key, value, result, storeEvidences) {
    if (storeEvidences) {
        const uuid = await initUuid();
        msg.payload.evidences.push({
            id: uuid(),
            key,
            value,
            result
        });
    }
}

module.exports = {
    existSection,
    extractTextFromPDF,
    addEvidence,
    initUuid
};