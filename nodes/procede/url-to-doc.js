const pdfParse = require('pdf-parse');
const axios = require('axios');

module.exports = function (RED) {
    function TextExtractorNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.on('input', async function (msg) {
            switch (msg.req.body.valueType) {
                case 'GithubUrl':
                    const user = msg.req.body.user;
                    const repo = msg.req.body.repo;
                    const path = msg.req.body.path;
                    const docName = encodeURIComponent(`${msg.req.body.docName}.pdf`);
                    const githubToken = msg.req.body.githubToken;
                    const githubUrl = `https://api.github.com/repos/${user}/${repo}/contents/${path}/${docName}`;
                    
                    if (!githubUrl) {
                        node.error('GitHub URL not provided');
                        msg.payload = 'GitHub URL not provided';
                        node.send(msg);
                        return;
                    }
                    if (!user) {
                        node.error('GitHub user not provided');
                        msg.payload = 'GitHub user not provided';
                        node.send(msg);
                        return;
                    }
                    try {
                        const htmlResponse = await axios.get(githubUrl, {
                            headers: {
                                Authorization: `Bearer ${githubToken}`
                            }
                        });
                        console.log(htmlResponse.data);
                        const file = htmlResponse.data;
                        const pdfUrl = file.download_url;

                        axios.get(pdfUrl, { responseType: 'arraybuffer' })
                            .then(response => {
                                const pdfContent = Buffer.from(response.data);
                                extractTextFromPDF(pdfContent, node, msg);
                            })
                            .catch(error => {
                                node.error('Error fetching PDF:', error);
                                msg.payload = 'Error fetching PDF: ' + error.message;
                                node.send(msg);
                            });
                    } catch (error) {
                        node.error('Error fetching GitHub HTML:', error);
                        msg.payload = 'Error fetching GitHub HTML: ' + error.message;
                        node.send(msg);
                    }
                    break;
                case 'URL':
                    const url = msg.req.body.url;
                    if (!url) {
                        node.error('URL not provided');
                        msg.payload = 'URL not provided';  
                        node.send(msg);
                        return;
                    }

                    if (url.endsWith('.pdf')) {
                        axios.get(url, { responseType: 'arraybuffer' })
                            .then(response => {
                                const pdfContent = Buffer.from(response.data);
                                extractTextFromPDF(pdfContent, node, msg);
                            })
                            .catch(error => {
                                node.error('Error fetching PDF:', error);
                                msg.payload = 'Error fetching PDF: ' + error.message;
                                node.send(msg);
                            });
                    
                    } else if (url.endsWith('.txt')) {
                        axios.get(url)
                            .then(response => {
                                msg.payload = response.data;
                                node.send(msg);
                            })
                            .catch(error => {
                                node.error('Error fetching TXT:', error);
                                msg.payload = 'Error fetching TXT: ' + error.message;
                                node.send(msg);
                            });
                    } else {
                        node.error('Unsupported file type');
                        msg.payload = 'Unsupported file type';
                        node.send(msg);
                    }
                default:
                    node.warn("Invalid filter type");
                    break;
            }
        });

        function extractTextFromPDF(url, node, msg) {
            pdfParse(url)
                .then(data => {
                    msg.payload = data.text;
                    node.send(msg);
                })
                .catch(error => {
                    node.error('Error extracting text from PDF: ' + error.message);
                    msg.payload = 'Error extracting text from PDF: ' + error.message;
                    node.send(msg);
                });
        }
    }

    RED.nodes.registerType('url-to-doc', TextExtractorNode);
};