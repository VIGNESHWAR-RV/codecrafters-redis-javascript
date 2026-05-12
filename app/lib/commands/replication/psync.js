const { serverDetails } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function pSyncCommand(clientId, replicationIdVal, offsetVal) {
  const { replicationId, offset } = serverDetails;
  return encodeToRespString(`FULLRESYNC ${replicationId} ${offset}`);
}

module.exports = {
  pSyncCommand,
};
