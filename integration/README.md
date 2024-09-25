# <picture>

<div align=center>
  <img src ="https://avatars.githubusercontent.com/u/151918147?s=200&v=4" width="200px" heigth="200px" alt="Node-RED Logo"></img></picture>
</div>
<h4 align="center">A node-red version focused on STATUS project data integration</h4>

## Description

The `@alvarobc2412/integration` package provides a set of Node-RED components tailored for the STATUS project. These nodes are responsible for collecting and integrating data from various sources such as GitHub, Trello, and others, making it easier to consolidate and process data from different platforms.

## Features

-   Collect data from multiple sources, including GitHub, Trello, and CSV files.
-   Parse logs and trace project information via URL endpoints.
-   Seamlessly integrate different types of data sources into Node-RED flows.

## Installation

You can install the package directly via npm:

```bash
npm install @alvarobc2412/integration
```

Or add it to your `package.json` and run `npm install`:

```json
{
    "dependencies": {
        "@alvarobc2412/integration": "^1.0.0"
    }
}
```

## Nodes Overview

This package includes the following custom nodes for use in Node-RED:

-   **github-collector**: Gathers data from GitHub repositories using the GitHub API.
-   **trello-collector**: Collects actions from Trello boards, focusing on attachment URLs.
-   **url-to-doc**: Extracts documents from a given URL.
-   **project-to-url**: Collect Trello projects and get their associated urls.
-   **log-getter**: Fetches and parses log data from a specified URL (supports JSON, XML, and GZIP formats).
-   **log-trace**: Tracks log activity and send each trace in separate messages.
-   **csv-reader**: Reads and parses CSV files from a given URL.

## License

This package is licensed under the [Apache-2.0 License](LICENSE).

## Author and Contributors

-   **Author**: [Álvaro Bernal](https://github.com/alvarobernal2412)
-   **Contributor**: [Francisco Montero](https://github.com/FJMonteroInformatica)

## Repository

You can find the source code and contribute to this project on GitHub:

[https://github.com/statuscompliance/node-red-status](https://github.com/statuscompliance/node-red-status)
