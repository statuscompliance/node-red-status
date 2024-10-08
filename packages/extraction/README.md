# <picture>

<div align=center>
  <img src ="https://avatars.githubusercontent.com/u/151918147?s=200&v=4" width="200px"  heigth="200px" alt="Node-RED Logo"></img></picture>
</div>
<h4 align="center">A node-red version focused on STATUS project information extraction</h4>

## Description

The `@statuscompliance/extraction` package is a collection of Node-RED components specifically designed for the STATUS project, focusing on extracting information from event traces and JSON objects. These nodes facilitate the retrieval of specific properties and values, enabling more efficient data handling within workflows.

## Features

-   Extract specific values from JSON objects or event traces.
-   Perform operations like fetching the last timestamp or retrieving key-value properties.
-   Nodes designed to integrate seamlessly with compliance-related processes in Node-RED flows.

## Installation

You can install the package directly via npm:

```bash
npm install @statuscompliance/extraction
```

Or add it to your `package.json` and run `npm install`:

```json
{
    "dependencies": {
        "@statuscompliance/extraction": "^1.0.0"
    }
}
```

## Nodes Overview

This package includes the following custom nodes for use in Node-RED:

-   **last-timestamp**: Extracts the most recent timestamp from a set of events.
-   **find-object**: Locates and extracts a specific object based on key criteria.
-   **get-property-value**: Retrieves the value of a specified property from a JSON object.
-   **get-kv-property**: Extracts key-value pairs from a JSON object for further processing.

## License

This package is licensed under the [Apache-2.0 License](LICENSE).

## Author and Contributors

-   **Author**: [Álvaro Bernal](https://github.com/alvarobernal2412)
-   **Contributor**: [Francisco Montero](https://github.com/FJMonteroInformatica)

## Repository

You can find the source code and contribute to this project on GitHub:

[https://github.com/statuscompliance/node-red-status](https://github.com/statuscompliance/node-red-status)
