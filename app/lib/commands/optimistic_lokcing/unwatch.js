const { logger } = require("../../contextualLogger");
const { clientLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function unWatchCommand(clientId) {
  const { watchedkeys } = clientLookup[clientId];

  if (watchedkeys) {
    logger.info(`unwatching the watched keys for the client - ${clientId}`);
    delete clientLookup[clientId].watchedkeys;
  }

  return encodeToRespString("OK");
}

module.exports = {
  unWatchCommand,
};
