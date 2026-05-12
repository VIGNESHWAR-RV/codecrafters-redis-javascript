const { serverDetails } = require("../../inMemoryLookup");
const { encodeToRespBulkString } = require("../../respParser");
const { generateReplicationId } = require("../../utils/idUtil");

function generateReplicationInfo() {
  return `
    # Replication
    role:${serverDetails.isReplica ? "slave" : "master"}
    master_replid:${generateReplicationId()}
    master_repl_offset:0
    `;
}

function infoCommand(clientId, infoName) {
  let res;
  switch (infoName) {
    case "replication": {
      res = generateReplicationInfo();
      break;
    }
    default: {
      const replicationInfo = generateReplicationInfo();

      return `${replicationInfo}`;
    }
  }

  return encodeToRespBulkString(res);
}

module.exports = {
  infoCommand,
};
