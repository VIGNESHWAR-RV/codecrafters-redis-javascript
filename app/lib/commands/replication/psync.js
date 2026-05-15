const { logger } = require("../../contextualLogger");
const {
  serverDetails,
  clientLookup,
  activeReplicaClientIds,
} = require("../../inMemoryLookup");
const {
  encodeToRespString,
  encodeToRespArray,
  encodeToRespBulkString,
} = require("../../respParser");

function pSyncCommand(clientId, replicationIdVal, offsetVal) {
  const { replicationId, offset } = serverDetails;
  const { connection } = clientLookup[clientId];

  if (replicationIdVal === "?" && +offsetVal === -1) {
    connection.write(
      encodeToRespString(`FULLRESYNC ${replicationId} ${offset}`).toString(),
    );
    const emptyRDBBase64 =
      "UkVESVMwMDEx+glyZWRpcy12ZXIFNy4yLjD6CnJlZGlzLWJpdHPAQPoFY3RpbWXCbQi8ZfoIdXNlZC1tZW3CsMQQAPoIYW9mLWJhc2XAAP/wbjv+wP9aog==";
    const emptyRDBBuffer = Buffer.from(emptyRDBBase64, "base64");
    connection.write(`$${emptyRDBBuffer.length}\r\n`);
    connection.write(emptyRDBBuffer);
    activeReplicaClientIds[clientId] = true;
  }
}

function notifyUpdatesToReplica(rawCmdRequest) {
  setImmediate(() => {
    const activeReplicas = Object.keys(activeReplicaClientIds).filter(
      (clientId) => clientLookup[clientId],
    );

    if (!activeReplicas.length) {
      logger.debug("No Active replicas to sync update");
      return;
    }

    logger.debug(
      `Sending update sync to total active replica - ${activeReplicas.length}`,
    );
    activeReplicas.forEach((clientId) => {
      const { connection } = clientLookup[clientId];
      connection.write(rawCmdRequest.toString());
    });
  });
}

module.exports = {
  pSyncCommand,
  notifyUpdatesToReplica,
};
