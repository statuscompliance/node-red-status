# <picture>

<div align=center>
  <img src ="https://avatars.githubusercontent.com/u/151918147?s=200&v=4" width="200px"  heigth="200px" alt="Node-RED Logo"></img></picture>
</div>
<h4 align="center">A node-red version focused on STATUS project filtering</h4>

## Description

The `@alvarobc2412/filtering` package is a collection of Node-RED components specifically designed for the STATUS project, focusing on filtering JSON object information. These nodes help to manage data flows by applying different filtering rules based on content, date ranges, or specific attributes.

## Features

-   Filter JSON data by various criteria such as classification, date ranges, or importance.
-   Group and filter messages based on dynamic attributes.
-   Nodes designed to work seamlessly with compliance-related processes in Node-RED flows.

## Installation

You can install the package directly via npm:

```bash
npm install @alvarobc2412/filtering
```

Or add it to your `package.json` and run `npm install`:

```json
{
    "dependencies": {
        "@alvarobc2412/filtering": "^1.0.0"
    }
}
```

## Nodes Overview

This package includes the following custom nodes for use in Node-RED:

-   **filter-by-date**: Filters messages based on date attributes within a specified range.
-   **filter-by**: Filters messages based on classification, importance, or other dynamic attributes.
-   **group-by**: Groups messages by a specific attribute for batch processing.

## License

This package is licensed under the [Apache-2.0 License](LICENSE).

## Author and Contributors

-   **Author**: [Álvaro Bernal](https://github.com/alvarobernal2412)
-   **Contributor**: [Francisco Montero](https://github.com/FJMonteroInformatica)

## Repository

You can find the source code and contribute to this project on GitHub:

[https://github.com/statuscompliance/node-red-status](https://github.com/statuscompliance/node-red-status)
