const pdfParse = require('pdf-parse');
const axios = require('axios');
module.exports = function (RED) {
    function ExistsSectionInDocNode(config) {
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
                        return;
                    }
                    if (!user) {
                        node.error('GitHub user not provided');
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
                                console.error('Error fetching PDF:', error);
                            });
                    } catch (error) {
                        console.error('Error fetching GitHub HTML:', error);
                    }
                    break;
                case 'URL':
                    const url = msg.req.body.url;
                    if (!url) {
                        node.error('URL not provided');
                        return;
                    }

                    if (url.endsWith('.pdf')) {
                        axios.get(url, { responseType: 'arraybuffer' })
                            .then(response => {
                                const pdfContent = Buffer.from(response.data);
                                extractTextFromPDF(pdfContent, node, msg);
                            })
                            .catch(error => {
                                console.error('Error fetching PDF:', error);
                            });
                    
                    } else if (url.endsWith('.txt')) {
                        axios.get(url)
                            .then(response => {
                                msg.payload = response.data;
                                existSection(msg);
                            })
                            .catch(error => {
                                console.error('Error fetching TXT:', error);
                            });
                    } else {
                        node.error('Unsupported file type');
                    }
                default:
                    node.warn("Invalid filter type");
                    break;
            }
        });

        function existSection(msg){
            var data = msg.payload;
            var section = config.section;
            msg.payload = data.includes(section).toString();
            node.send(msg);
        }

        function extractTextFromPDF(url, node, msg) {
            pdfParse(url)
                .then(data => {
                    msg.payload = data.text;
                    existSection(msg);
                })
                .catch(error => {
                    node.error('Error extracting text from PDF: ' + error.message);
                });
        }
    }
    RED.nodes.registerType('exists-section-in-doc', ExistsSectionInDocNode);
};
