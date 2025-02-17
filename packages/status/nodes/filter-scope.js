module.exports = function (RED) {
  function FilterScope(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.filters = config.filters || [];

    function flattenData(data, attribute, result = []) {
      if (Array.isArray(data)) {
        data.forEach((item) => flattenData(item, attribute, result));
      } else if (data && typeof data === "object") {
        if (data[attribute] !== undefined || Object.values(data).includes(attribute)) {
          result.push(data);
        } else {
          Object.values(data).forEach((value) => flattenData(value, attribute, result));
        }
      }
      return result;
    }

    node.on("input", function (msg) {
      const newMsg = { ...msg };
      const {
        scope // This corresponds to the scopeSets object
      } = msg.req?.body || {};
      const scopeCopy = { ...scope }; 

      let validation = true;
      let filters = node.filters || [];

      if (!scopeCopy) {
        node.error("Scope is required");
        return node.send(newMsg);
      }

      const data = (msg.payload?.trace?.string) || msg.payload?.string || msg.payload || [];
      if (!Array.isArray(data)) {
        node.error("Invalid data format. Expected an array in trace.string or payload.");
        return node.send(newMsg);
      }

      filters.map((filter) => { 
        const { attribute, value } = filter;
        const flatteredData = flattenData(data, value);
        const scopeValue = scopeCopy[attribute];
        if(scopeValue === '*') {
          scopeCopy[attribute] = flatteredData.find(item => item.key === value)?.value || scopeCopy[attribute];
          validation = validation && true;
        } else {
          validation = validation && flatteredData.some(item => item.value === scopeValue);
        }
      });

      newMsg.payload = {
        ...newMsg.payload,
        scope: scopeCopy
      };

      validation ? node.send(newMsg): node.send(null);
    });
  }

  RED.nodes.registerType("filter-scope", FilterScope);
};