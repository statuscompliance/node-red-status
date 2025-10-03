# node-red-status-commons

Common utilities for STATUS compliance Node-RED packages.

## Installation

```bash
npm install node-red-status-commons
```

## Usage

```javascript
const { addEvidence, existSection, extractTextFromPDF } = require('node-red-status-commons');
```

## Functions

### addEvidence(msg, key, value, result, storeEvidences)
Adds evidence to the message payload if evidence storage is enabled.

### existSection(msg, storeEvidences, config, node)
Checks if a specific section exists in the message data.

### extractTextFromPDF(pdfContent, node, msg, storeEvidences, pdfParse)
Extracts text from PDF content using the provided pdf-parse module.