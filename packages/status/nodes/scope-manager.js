module.exports = function (RED) {
  function StatusParser(config) {
    RED.nodes.createNode(this, config);
    const node = this;

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

    function getValueByKey(key, data) {
      const foundItem = data.find(item => {
        if (item.key && item.value) {
          return item.key === key;  
        } else {
          return item.hasOwnProperty(key);
        }
      });
    
      if (foundItem) {
        if (foundItem.key && foundItem.value) {
          return foundItem.value; 
        } else {
          return foundItem[key];
        }
      }
    
      return null;  // Return null if the key is not found
    }

    function searchLevel(data, level) {
      if (level) {
        const list = flattenData(data, level);
        return getValueByKey(level, list);
      }
      return null;
    }

    node.on("input", function (msg) {
      const newMsg = { ...msg };
      const {
        from = config.from,
        to = config.to,
        controlId =  config.controlId,
        level1 = config.level1,
        level2 = config.level2,
        level3 = config.level3,
        scope
      } = msg.req?.body || {};

      if (!scope) {
        node.error("Scope is required");
        return node.send(newMsg);
      }

      const data = (msg.payload.trace && msg.payload.trace.string) || msg.payload.string || msg.payload || [];
      if (!Array.isArray(data)) {
        node.error("Invalid data format. Expected an array in trace.string or payload.");
        return node.send(newMsg);
      }

      const scopeKeys = Object.keys(scope);
      const level1Result = searchLevel(data, level1);
      const level2Result = searchLevel(data, level2);
      const level3Result = searchLevel(data, level3);

      const scopeResult = {
        [scopeKeys[0]]: scope[scopeKeys[0]] === '*' ? level1Result :  scope[scopeKeys[0]],
        [scopeKeys[1]]: scope[scopeKeys[1]] === '*' ? level2Result :  scope[scopeKeys[1]],
        [scopeKeys[2]]: scope[scopeKeys[2]] === '*' ? level3Result :  scope[scopeKeys[2]]
      };

      newMsg.payload = {
        ...newMsg.payload,
        scope: scopeResult,
        period: {
          from,
          to
        },
        controlId: controlId
      };

      node.send(newMsg);
    });
  }

  RED.nodes.registerType("scope-manager", StatusParser);
};