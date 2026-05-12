const { serverDetails } = require("../../inMemoryLookup");
const { encodeToRespBulkString } = require("../../respParser");

function generateReplicationInfo() {
  return `
    # Replication
    role:${serverDetails.isReplica ? "slave" : "master"}
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
