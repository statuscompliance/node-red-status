# <picture>

<div align=center>
  <img src ="https://avatars.githubusercontent.com/u/151918147?s=200&v=4" width="200px"  heigth="200px" alt="Node-RED Logo"></img></picture>
</div>
<h4 align="center">A node-red version focused on STATUS project flows</h4>

## Description

The `@statuscompliance/ai` package contains a custom Node-Red node called `ai-response` that provides an ai asistant response using google Gemini Model.

## Features

-   Takes an input prompt from msg.payload.
-   You can customize the ai response context on the `Sistem Prompt` input field.
-   Returns the AI Model response for further operations.


## Installation

You can install the package directly via npm:

```bash
npm install @statuscompliance/ai
```

Or add it to your `package.json` and run `npm install`:

```json
{
    "dependencies": {
        "@statuscompliance/ai": "^1.0.0"
    }
}
```

## Nodes Overview

This package includes the following custom nodes for use in Node-RED:

-   **ai-response**: Manages AI response using Google Gemini API.

## License

This package is licensed under the [Apache-2.0 License](LICENSE).

## Author and Contributors

-   **Author**: [Álvaro Bernal](https://github.com/alvarobernal2412)
-   **Contributor**: [Francisco Montero](https://github.com/FJMonteroInformatica)

## Repository

You can find the source code and contribute to this project on GitHub:

[https://github.com/statuscompliance/node-red-status](https://github.com/statuscompliance/node-red-status)
