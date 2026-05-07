const { clientLookup, redisLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function watchCommand(clientId, ...keysToWatch) {
  const { queuedCommands, watchedKeys = {} } = clientLookup[clientId];

  if (queuedCommands) {
    throw new Error("WATCH inside MULTI is not allowed");
  }

  if (keysToWatch.length) {
    const keysToBeWatched = { ...watchedKeys };
    keysToWatch.forEach((key) => {
      const { updatedAt = null } = redisLookup?.[key] ?? {};
      keysToBeWatched[key] = updatedAt;
    });
    clientLookup[clientId].watchedKeys = keysToBeWatched;
  }

  return encodeToRespString("OK");
}

module.exports = {
  watchCommand,
};
