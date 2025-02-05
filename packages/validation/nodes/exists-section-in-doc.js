const pdfParse = require("pdf-parse");
const axios = require("axios");
module.exports = function (RED) {
    function ExistsSectionInDocNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.on("input", async function (msg) {
            let valueType = msg.req && msg.req.body && msg.req.body.valueType !== undefined ? msg.req.body.valueType : config.valueType;
            switch (valueType) {
                case "GithubUrl":
                    let user = msg.req && msg.req.body && msg.req.body.user !== undefined ? msg.req.body.user : config.user;
                    let repo = msg.req && msg.req.body && msg.req.body.repo !== undefined ? msg.req.body.repo : config.repo;
                    let path = msg.req && msg.req.body && msg.req.body.path !== undefined ? msg.req.body.path : config.path;
                    let docName = encodeURIComponent(msg.req && msg.req.body && msg.req.body.docName !== undefined ? `${msg.req.body.docName}.pdf` : `${config.docName}.pdf`);
                    let githubToken = msg.req && msg.req.body && msg.req.body.githubToken !== undefined ? msg.req.body.githubToken : config.githubToken;

                    let githubUrl = `https://api.github.com/repos/${user}/${repo}/contents/${path}/${docName}`;

                    if (!user || !repo || !path || !docName || !githubToken) {
                        node.error("Missing required parameters");
                        msg.payload = "Missing required parameters";
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
                                msg.payload =
                                    "Error fetching PDF: " + error.message;
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
                    let url = msg.req && msg.req.body && msg.req.body.url !== undefined ? msg.req.body.url : config.url;
                    if (!url) {
                        node.error("URL not provided");
                        msg.payload = "URL not provided";
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
                                msg.payload =
                                    "Error fetching PDF: " + error.message;
                                node.send(msg);
                            });
                    } else if (url.endsWith(".txt")) {
                        axios
                            .get(url)
                            .then((response) => {
                                msg.payload = response.data;
                                existSection(msg);
                            })
                            .catch((error) => {
                                node.error("Error fetching TXT:", error);
                                msg.payload =
                                    "Error fetching TXT: " + error.message;
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
            var data = msg.payload;
            var section = msg.req.body.section || config.section;
            msg.payload = { result: data.includes(section).toString() };
            node.send(msg);
        }

        function extractTextFromPDF(url, node, msg) {
            pdfParse(url)
                .then((data) => {
                    msg.payload = data.text;
                    existSection(msg);
                })
                .catch((error) => {
                    node.error(
                        "Error extracting text from PDF: " + error.message
                    );
                    msg.payload =
                        "Error extracting text from PDF: " + error.message;
                    node.send(msg);
                });
        }
    }
    RED.nodes.registerType("exists-section-in-doc", ExistsSectionInDocNode);
};
