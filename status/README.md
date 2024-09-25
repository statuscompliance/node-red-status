# <picture>

<div align=center>
  <img src ="https://avatars.githubusercontent.com/u/151918147?s=200&v=4" width="200px" heigth="200px" alt="Node-RED Logo"></img></picture>
</div>
<h4 align="center">Node-RED Logic Functions for STATUS Project</h4>

## Description

The `@alvarobc2412/status` package provides essential components for integrating the STATUS project with Node-RED. It includes nodes that facilitate storing and parsing data, enabling seamless communication between Node-RED and system backends.

## Features

-   Collect and store data from incoming messages.
-   Batch processing and efficient data transfer to backend APIs.
-   Parsing capabilities for incoming STATUS project data formats.

## Installation

Install via npm:

```bash
npm install @alvarobc2412/status
```

Or add the dependency to your `package.json`:

```json
{
    "dependencies": {
        "@alvarobc2412/status": "^1.0.0"
    }
}
```

## Nodes Overview

This package includes the following STATUS integration nodes:

-   **status-parser**: Parses STATUS project-specific data formats.
-   **status-storer**: Buffers and sends bulk messages to a backend API, reducing network overhead and improving performance.

## License

Licensed under the [Apache-2.0 License](LICENSE).

## Author and Contributors

-   **Author**: [Álvaro Bernal](https://github.com/alvarobernal2412)
-   **Contributor**: [Francisco Montero](https://github.com/FJMonteroInformatica)

## Repository

Find the source code and contribute on GitHub:

[https://github.com/statuscompliance/node-red-status](https://github.com/statuscompliance/node-red-status)
