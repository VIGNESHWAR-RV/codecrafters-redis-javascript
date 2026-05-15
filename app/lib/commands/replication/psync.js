const { logger } = require("../../contextualLogger");
const { serverDetails, clientLookup } = require("../../inMemoryLookup");
const { encodeToRespString, encodeToRespArray } = require("../../respParser");

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

    logger.debug(`Sent Empty RDB file to replica`);

    clientLookup[clientId].isReadyForUpdates = true;
  }
}

function notifyUpdatesToReplica(...cmdArgs) {
  setImmediate(() => {
    const activeReplicas = Object.values(clientLookup).filter(
      ({ isReplica, isReadyForUpdates }) => isReplica && isReadyForUpdates,
    );

    if (activeReplicas.length) {
      logger.debug("No Active replicas to sync update");
      return;
    }

    logger.debug(
      `Sending update sync to total active replica - ${activeReplicas.length}`,
    );
    activeReplicas.forEach(({ connection }) =>
      connection.write(encodeToRespArray(cmdArgs).toString()),
    );
  });
}

module.exports = {
  pSyncCommand,
  notifyUpdatesToReplica,
};
