const { clientLookup } = require("../../inMemoryLookup");

function unWatchCommand(clientId) {
  const { watchedkeys } = clientLookup[clientId];

  if (watchedkeys) {
    delete clientLookup[clientId].watchedkeys;
  }
}

module.exports = {
  unWatchCommand,
};
