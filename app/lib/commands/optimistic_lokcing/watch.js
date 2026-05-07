const { clientLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function watchCommand(clientId, ...keysToWatch) {
  const { queuedCommands } = clientLookup[clientId];

  if (queuedCommands) {
    throw new Error("WATCH inside MULTI is not allowed");
  }

  return encodeToRespString("OK");
}

module.exports = {
  watchCommand,
};
