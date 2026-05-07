const { clientLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function discardCommand(clientId) {
  const clientData = clientLookup[clientId];

  if (!clientData.queuedCommands) {
    throw new Error("DISCARD without MULTI");
  }

  if (clientData.watchedKeys) {
    delete clientData.watchedKeys;
  }

  delete clientData.queuedCommands;
  return encodeToRespString("OK");
}

module.exports = {
  discardCommand,
};
