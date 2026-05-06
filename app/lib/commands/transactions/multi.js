const { redisLookup, clientLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function multiCommand(clientId) {
  clientLookup.get(clientId).queuedCommands = [];
  return encodeToRespString("OK");
}

module.exports = {
  multiCommand,
};
