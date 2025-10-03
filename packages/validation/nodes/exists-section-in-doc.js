const axios = require("axios");
const { addEvidence, existSection , extractTextFromPDF } = require('@statuscompliance/commons')
let pdfParse = null;

// Función para inicializar pdf-parse de forma asíncrona
async function initPdfParse() {
    if (!pdfParse) {
        pdfParse = (await import('pdf-parse')).default;
    }
    return pdfParse;
}

module.exports = function (RED) {
    function ExistsSectionInDocNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.on("input", async function (msg) {
            let valueType = msg.req?.body?.valueType ?? config.valueType;
            const storeEvidences = config.storeEvidences;
            switch (valueType) {
                case "GithubUrl":
                    let user = msg.req?.body?.user ?? config.user;
                    let repo = msg.req?.body?.repo ?? config.repo;
                    let path = msg.req?.body?.path ?? config.path;
                    let docName = encodeURIComponent(`${msg.req?.body?.docName ?? config.docName}.pdf`);
                    let githubToken = msg.req?.body?.githubToken ?? config.githubToken;
                    let githubUrl = `https://api.github.com/repos/${user}/${repo}/contents/${path}/${docName}`;
                    msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];

                    if (!user || !repo || !path || !docName || !githubToken) {
                        node.error("Missing required parameters");
                        msg.payload.result = false;
                        await addEvidence(msg, "Missing required parameters", "Missing required parameters", false, storeEvidences);
                        node.send(msg);
                        return;
                    }
                    try {
                        const htmlResponse = await axios.get(githubUrl, {
                            headers: {
                                Authorization: `Bearer ${githubToken}`,
                            },
                        });
                        const file = htmlResponse.data;
                        const pdfUrl = file.download_url;

                        axios
                            .get(pdfUrl, { responseType: "arraybuffer" })
                            .then(async (response) => {
                                const pdfContent = Buffer.from(response.data);
                                const pdfParseModule = await initPdfParse();
                                await extractTextFromPDF(pdfContent, node, msg, storeEvidences, pdfParseModule);
                            })
                            .catch(async (error) => {
                                node.error("Error fetching PDF:", error);
                                msg.payload.result = false;
                                await addEvidence(msg, "PDF", "Error fetching PDF", false, storeEvidences);
                                node.send(msg);
                            });
                    } catch (error) {
                        node.error("Error fetching GitHub HTML:", error);
                        msg.payload =
                            "Error fetching GitHub HTML: " + error.message;
                        node.send(msg);
                    }
                    break;
                case "URL":
                    let url = msg.req?.body?.url ?? config.url;
                    if (!url) {
                        node.error("URL not provided");
                        msg.payload.result = false;
                        await addEvidence(msg, "URL", "URL not provided", false, storeEvidences);
                        node.send(msg);
                        return;
                    }

                    if (url.endsWith(".pdf")) {
                        axios
                            .get(url, { responseType: "arraybuffer" })
                            .then(async (response) => {
                                const pdfContent = Buffer.from(response.data);
                                const pdfParseModule = await initPdfParse();
                                await extractTextFromPDF(pdfContent, node, msg, storeEvidences, pdfParseModule);
                            })
                            .catch(async (error) => {
                                node.error("Error fetching PDF:", error);
                                msg.payload.result = false;
                                await addEvidence(msg, "PDF", "Error fetching PDF", false, storeEvidences);
                                node.send(msg);
                            });
                    } else if (url.endsWith(".txt")) {
                        axios
                            .get(url)
                            .then(async (response) => {
                                msg.payload.result = response.data;
                                await existSection(msg, storeEvidences, config, node);
                            })
                            .catch(async (error) => {
                                node.error("Error fetching TXT:", error);
                                msg.payload.result = false;
                                await addEvidence(msg, "TXT", "Error fetching TXT", false, storeEvidences);
                                node.send(msg);
                            });
                    } else {
                        node.error("Unsupported file type");
                        msg.payload = "Unsupported file type";
                        node.send(msg);
                    }
                    break;
                default:
                    node.warn("Invalid filter type");
                    break;
            }
        });
    }
    RED.nodes.registerType("exists-section-in-doc", ExistsSectionInDocNode);
};
