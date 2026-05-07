const { encodeToRespString } = require("../../respParser");

function watchCommand(clientId, ...keysToWatch) {
  return encodeToRespString("OK");
}

module.exports = {
  watchCommand,
};
