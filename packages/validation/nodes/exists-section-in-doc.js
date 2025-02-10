const pdfParse = require("pdf-parse");
const axios = require("axios");
const { v4: uuidv4 } = require('uuid');

module.exports = function (RED) {
    function ExistsSectionInDocNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.on("input", async function (msg) {
            let valueType = msg.req?.body?.valueType ?? config.valueType;
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
                        addEvidence(msg, "Missing required parameters", "Missing required parameters", false);
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
                            .then((response) => {
                                const pdfContent = Buffer.from(response.data);
                                extractTextFromPDF(pdfContent, node, msg);
                            })
                            .catch((error) => {
                                node.error("Error fetching PDF:", error);
                                msg.payload.result = false;
                                addEvidence(msg, "PDF", "Error fetching PDF", false);
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
                        addEvidence(msg, "URL", "URL not provided", false);
                        node.send(msg);
                        return;
                    }

                    if (url.endsWith(".pdf")) {
                        axios
                            .get(url, { responseType: "arraybuffer" })
                            .then((response) => {
                                const pdfContent = Buffer.from(response.data);
                                extractTextFromPDF(pdfContent, node, msg);
                            })
                            .catch((error) => {
                                node.error("Error fetching PDF:", error);
                                msg.payload.result = false;
                                addEvidence(msg, "PDF", "Error fetching PDF", false);
                                node.send(msg);
                            });
                    } else if (url.endsWith(".txt")) {
                        axios
                            .get(url)
                            .then((response) => {
                                msg.payload.result = response.data;
                                existSection(msg);
                            })
                            .catch((error) => {
                                node.error("Error fetching TXT:", error);
                                msg.payload.result = false;
                                addEvidence(msg, "TXT", "Error fetching TXT", false);
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

        function existSection(msg) {
            let data = msg.payload.result;
            let section = msg.req?.body?.section ?? config.section;
            const result =  data.includes(section).toString();
            msg.payload.result = result;
            const evidence = {
                section: section,
                data: data,
            }
            addEvidence(msg, "Section", evidence, result);
            node.send(msg);
        }

        function extractTextFromPDF(url, node, msg) {
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
                    addEvidence(msg, "PDF", "Error extracting text from PDF", false);
                    node.send(msg);
                });
        }

        function addEvidence(msg, key, value, result) {
            msg.payload.evidences.push({
                id: uuidv4(),
                key,
                value,
                result
            });
        }
    }
    RED.nodes.registerType("exists-section-in-doc", ExistsSectionInDocNode);
};
