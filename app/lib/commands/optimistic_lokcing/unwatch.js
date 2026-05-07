const { logger } = require("../../contextualLogger");
const { clientLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function unWatchCommand(clientId) {
  const { watchedKeys } = clientLookup?.[clientId] ?? {};

  if (watchedKeys) {
    logger.info(`unwatching the watched keys for the client - ${clientId}`);
    delete clientLookup[clientId].watchedKeys;
  }

  return encodeToRespString("OK");
}

module.exports = {
  unWatchCommand,
};
