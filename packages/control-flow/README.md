# <picture>

<div align=center>
  <img src ="https://avatars.githubusercontent.com/u/151918147?s=200&v=4" width="200px"  heigth="200px" alt="Node-RED Logo"></img></picture>
</div>
<h4 align="center">A node-red version focused on STATUS project flows</h4>

## Description

The `@statuscompliance/control-flow` package is a collection of Node-RED components specifically designed for the STATUS project, focusing on performing control-flow checks within workflows. This set of nodes helps ensure the correct sequencing and coexistence of events, enabling more robust compliance and control flow management.

## Features

-   Perform control-flow validations between multiple events.
-   Ensure that sequential actions follow specified patterns (e.g., "Event B" occurs after "Event A").
-   Invert logic checks to handle negative cases.
-   Nodes ready for integration with compliance-related processes in Node-RED flows.

## Installation

You can install the package directly via npm:

```bash
npm install @statuscompliance/control-flow
```

Or add it to your `package.json` and run `npm install`:

```json
{
    "dependencies": {
        "@statuscompliance/control-flow": "^1.0.0"
    }
}
```

## Nodes Overview

This package includes the following custom nodes for use in Node-RED:

-   **response**: Manages responses within a sequence of events.
-   **coexistence**: Ensures that certain events coexist within a specified timeframe.
-   **responded-existence**: Verifies that Event B occurs at any point after Event A.
-   **chain-response**: Checks if Event B occurs immediately after Event A.

## License

This package is licensed under the [Apache-2.0 License](LICENSE).

## Author and Contributors

-   **Author**: [Álvaro Bernal](https://github.com/alvarobernal2412)
-   **Contributor**: [Francisco Montero](https://github.com/FJMonteroInformatica)

## Repository

You can find the source code and contribute to this project on GitHub:

[https://github.com/statuscompliance/node-red-status](https://github.com/statuscompliance/node-red-status)
