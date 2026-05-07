const { clientLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function unWatchCommand(clientId) {
  const { watchedkeys } = clientLookup[clientId];

  if (watchedkeys) {
    delete clientLookup[clientId].watchedkeys;
  }

  return encodeToRespString("OK");
}

module.exports = {
  unWatchCommand,
};
