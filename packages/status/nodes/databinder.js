const { addEvidence } = require('@statuscompliance/commons');

module.exports = function (RED) {
    function DataBinderNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        this.on("input", async function (msg) {
            try {
                // Get configuration from message or node config
                const datasourceId = msg.req?.body?.datasourceId ?? config.datasourceId ?? msg.datasourceId;
                const linkerConfig = msg.req?.body?.linker ?? config.linker ?? msg.linker;
                const methodName = msg.req?.body?.methodName ?? config.methodName ?? 'default';
                const responseFormat = msg.req?.body?.responseFormat ?? config.responseFormat ?? 'full';
                const batchSize = parseInt(msg.req?.body?.batchSize ?? config.batchSize ?? 100);
                const storeEvidences = config.storeEvidences ?? false;

                // Validate required parameters
                if (!datasourceId) {
                    const error = new Error("Datasource ID is required");
                    node.error(error.message);
                    msg.payload = { error: error.message, result: false };
                    try {
                        await addEvidence(msg, "databinder-validation", { datasourceId, error: error.message }, false, storeEvidences);
                    } catch (evidenceError) {
                        node.warn("Failed to add evidence: " + evidenceError.message);
                    }
                    return node.send(msg);
                }

                // Parse linker configuration if it's a string
                let parsedLinkerConfig = linkerConfig;
                if (typeof linkerConfig === 'string') {
                    try {
                        parsedLinkerConfig = JSON.parse(linkerConfig);
                    } catch (parseError) {
                        const error = new Error("Invalid JSON in linker configuration: " + parseError.message);
                        node.error(error.message);
                        msg.payload = { error: error.message, result: false };
                        try {
                            await addEvidence(msg, "databinder-validation", { linkerConfig, error: error.message }, false, storeEvidences);
                        } catch (evidenceError) {
                            node.warn("Failed to add evidence: " + evidenceError.message);
                        }
                        return node.send(msg);
                    }
                }

                if (!parsedLinkerConfig || typeof parsedLinkerConfig !== 'object') {
                    const error = new Error("Linker configuration is required and must be an object");
                    node.error(error.message);
                    msg.payload = { error: error.message, result: false };
                    try {
                        await addEvidence(msg, "databinder-validation", { linkerConfig: parsedLinkerConfig, error: error.message }, false, storeEvidences);
                    } catch (evidenceError) {
                        node.warn("Failed to add evidence: " + evidenceError.message);
                    }
                    return node.send(msg);
                }

                // Import databinder package
                let DatasourceCatalog, Linker, DataBinder, RestApiDatasource, GithubApiDatasource, MicrosoftGraphDatasource;
                
                try {
                    // Import the databinder package
                    const databinder = require('@statuscompliance/databinder');
                    
                    // Extract required classes from the correct structure
                    DatasourceCatalog = databinder.DatasourceCatalog;
                    Linker = databinder.Linker;
                    DataBinder = databinder.DataBinder;
                    
                    // Extract datasource classes from the Datasources namespace
                    RestApiDatasource = databinder.Datasources.RestApiDatasource;
                    GithubApiDatasource = databinder.Datasources.GithubApiDatasource;
                    MicrosoftGraphDatasource = databinder.Datasources.MicrosoftGraphDatasource;
                    
                    // Validate that required classes are available
                    if (!DatasourceCatalog || !Linker || !DataBinder) {
                        throw new Error("Required classes (DatasourceCatalog, Linker, DataBinder) not found in @statuscompliance/databinder package");
                    }
                    
                    node.log("Successfully loaded @statuscompliance/databinder package");
                    
                } catch (importError) {
                    const error = new Error("Failed to import @statuscompliance/databinder: " + importError.message + ". Make sure to install the package: npm install @statuscompliance/databinder");
                    node.error(error.message);
                    msg.payload = { error: error.message, result: false };
                    try {
                        await addEvidence(msg, "databinder-import", { error: error.message }, false, storeEvidences);
                    } catch (evidenceError) {
                        node.warn("Failed to add evidence: " + evidenceError.message);
                    }
                    return node.send(msg);
                }

                try {
                    // Initialize the catalog and register available datasources
                    const catalog = new DatasourceCatalog();
                    
                    // Register built-in datasources with error handling
                    let registeredCount = 0;
                    
                    if (RestApiDatasource) {
                        try {
                            catalog.registerDatasource(RestApiDatasource);
                            registeredCount++;
                            node.log("Registered REST API datasource");
                        } catch (regError) {
                            node.warn("Failed to register REST API datasource: " + regError.message);
                        }
                    } else {
                        node.warn("RestApiDatasource not found in imported package");
                    }
                    
                    if (GithubApiDatasource) {
                        try {
                            catalog.registerDatasource(GithubApiDatasource);
                            registeredCount++;
                            node.log("Registered GitHub API datasource");
                        } catch (regError) {
                            node.warn("Failed to register GitHub API datasource: " + regError.message);
                        }
                    } else {
                        node.warn("GithubApiDatasource not found in imported package");
                    }
                    
                    if (MicrosoftGraphDatasource) {
                        try {
                            catalog.registerDatasource(MicrosoftGraphDatasource);
                            registeredCount++;
                            node.log("Registered Microsoft Graph datasource");
                        } catch (regError) {
                            node.warn("Failed to register Microsoft Graph datasource: " + regError.message);
                        }
                    } else {
                        node.warn("MicrosoftGraphDatasource not found in imported package");
                    }
                    
                    node.log(`Registered ${registeredCount} datasource definitions out of 3 available`);
                    
                    if (registeredCount === 0) {
                        node.warn("No datasource definitions were successfully registered. Check if @statuscompliance/databinder is properly installed.");
                    }

                    // Create datasource instances from linker configuration
                    const datasourceInstances = [];
                    
                    if (parsedLinkerConfig.datasources && Array.isArray(parsedLinkerConfig.datasources)) {
                        for (const dsConfig of parsedLinkerConfig.datasources) {
                            if (dsConfig.definitionId && dsConfig.config) {
                                try {
                                    const instance = catalog.createDatasourceInstance(
                                        dsConfig.definitionId, 
                                        dsConfig.config,
                                        dsConfig.id
                                    );
                                    datasourceInstances.push(instance);
                                } catch (dsError) {
                                    node.warn(`Failed to create datasource instance for ${dsConfig.definitionId}: ${dsError.message}`);
                                }
                            }
                        }
                    }

                    if (datasourceInstances.length === 0) {
                        const error = new Error("No valid datasource instances could be created");
                        node.error(error.message);
                        msg.payload = { error: error.message, result: false };
                        try {
                            await addEvidence(msg, "databinder-datasources", { linkerConfig: parsedLinkerConfig, error: error.message }, false, storeEvidences);
                        } catch (evidenceError) {
                            node.warn("Failed to add evidence: " + evidenceError.message);
                        }
                        return node.send(msg);
                    }

                    // Create the linker
                    const linker = new Linker({
                        datasources: datasourceInstances,
                        datasourceConfigs: parsedLinkerConfig.datasourceConfigs || {},
                        defaultMethodName: parsedLinkerConfig.defaultMethodName || 'default'
                    });

                    // Create the DataBinder
                    const dataBinder = new DataBinder({
                        linker: linker,
                        responseFormat: responseFormat,
                        defaultBatchSize: batchSize
                    });

                    // Fetch data from the specified datasource
                    const fetchOptions = {
                        methodName: methodName,
                        responseFormat: responseFormat,
                        batchSize: batchSize,
                        // Pass any additional options from the message
                        ...msg.fetchOptions
                    };

                    let result;
                    if (datasourceId === 'all') {
                        // Fetch from all datasources
                        result = await dataBinder.fetchAll(fetchOptions);
                    } else {
                        // Fetch from specific datasource
                        result = await dataBinder.fetchFromDatasource(datasourceId, fetchOptions);
                    }

                    // Prepare success response
                    const newMsg = { ...msg };
                    newMsg.payload = {
                        result: true,
                        data: result,
                        metadata: {
                            datasourceId: datasourceId,
                            methodName: methodName,
                            responseFormat: responseFormat,
                            timestamp: new Date().toISOString()
                        }
                    };

                    // Add evidence if enabled
                    if (storeEvidences) {
                        try {
                            newMsg.payload.evidences = Array.isArray(newMsg.payload.evidences) ? newMsg.payload.evidences : [];
                            await addEvidence(newMsg, "databinder-success", {
                                datasourceId,
                                methodName,
                                responseFormat,
                                dataCount: Array.isArray(result?.data) ? result.data.length : (result ? 1 : 0)
                            }, true, storeEvidences);
                        } catch (evidenceError) {
                            node.warn("Failed to add success evidence: " + evidenceError.message);
                        }
                    }

                    node.send(newMsg);

                } catch (operationError) {
                    const error = new Error("DataBinder operation failed: " + operationError.message);
                    node.error(error.message);
                    msg.payload = { 
                        error: error.message, 
                        result: false,
                        metadata: {
                            datasourceId: datasourceId,
                            methodName: methodName,
                            timestamp: new Date().toISOString()
                        }
                    };
                    try {
                        await addEvidence(msg, "databinder-error", { 
                            datasourceId, 
                            methodName, 
                            error: error.message 
                        }, false, storeEvidences);
                    } catch (evidenceError) {
                        node.warn("Failed to add error evidence: " + evidenceError.message);
                    }
                    node.send(msg);
                }

            } catch (generalError) {
                const error = new Error("General error in DataBinder node: " + generalError.message);
                node.error(error.message);
                msg.payload = { 
                    error: error.message, 
                    result: false,
                    timestamp: new Date().toISOString()
                };
                const storeEvidencesLocal = config.storeEvidences ?? false;
                if (storeEvidencesLocal) {
                    try {
                        msg.payload.evidences = Array.isArray(msg.payload.evidences) ? msg.payload.evidences : [];
                        await addEvidence(msg, "databinder-general-error", { error: error.message }, false, storeEvidencesLocal);
                    } catch (evidenceError) {
                        node.warn("Failed to add general error evidence: " + evidenceError.message);
                    }
                }
                node.send(msg);
            }
        });
    }

    RED.nodes.registerType("databinder", DataBinderNode);
};