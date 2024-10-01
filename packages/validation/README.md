# <picture>

<div align=center>
  <img src ="https://avatars.githubusercontent.com/u/151918147?s=200&v=4" width="200px" height="200px" alt="Node-RED Logo"></img></picture>
</div>
<h4 align="center">Node-RED Validation Functions for STATUS Project</h4>

## Description

The `@statuscompliance/validation` package provides essential components for the STATUS project, aimed at validating and checking compliance within Node-RED. It includes nodes that enable users to verify data, perform document checks, and ensure compliance with project-specific requirements.

## Features

-   Validate the presence of certain data in incoming messages.
-   Check document content and structure for compliance purposes.
-   Support for PDF and text files sourced from GitHub or direct URLs.

## Installation

Install via npm:

```bash
npm install @statuscompliance/validation
```

Or add the dependency to your `package.json`:

```json
{
    "dependencies": {
        "@statuscompliance/validation": "^1.0.0"
    }
}
```

## Nodes Overview

This package includes the following STATUS validation nodes:

-   **exists-pipe**: Validates that a specified number of keys are present in an incoming message.
-   **exists-url**: Checks if a given URL is reachable.
-   **exists-section-in-doc**: Verifies if a specific section or text is present in a document, supporting PDF and TXT formats.
-   **has-activity**: Checks if activity logs exist for a specified entity.
-   **check-property**: Verifies the value of a property in an incoming message.
-   **is-valid-url**: Determines if a given URL is valid.

## License

Licensed under the [Apache-2.0 License](LICENSE).

## Author and Contributors

-   **Author**: [Álvaro Bernal](https://github.com/alvarobernal2412)
-   **Contributor**: [Francisco Montero](https://github.com/FJMonteroInformatica)

## Repository

Find the source code and contribute on GitHub:

[https://github.com/statuscompliance/node-red-status](https://github.com/statuscompliance/node-red-status)
