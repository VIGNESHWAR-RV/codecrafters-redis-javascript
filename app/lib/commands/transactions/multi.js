const { redisLookup, clientLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function multiCommand(clientId) {
  const clientData = clientLookup[clientId];
  if (clientData.queuedCommands) {
    throw new Error("MULTI within MULTI");
  }
  clientData.queuedCommands = [];
  return encodeToRespString("OK");
}

module.exports = {
  multiCommand,
};
