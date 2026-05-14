const net = require("net");
const { logger } = require("../contextualLogger");
const { generateContextID } = require("../utils/idUtil");
const {
  decodeResp,
  encodeToRespArray,
  encodeToRespBulkString,
} = require("../respParser");
const { clientLookup, serverDetails } = require("../inMemoryLookup");

async function sendCommandAndGetResponse(connection, ...cmdArgs) {
  return new Promise((resolve, reject) => {
    logger.initSubContext({ replicaReqId: generateContextID() }, () => {
      connection.once("data", (data) => {
        const response = decodeResp(data);
        connection.removeListener("error", reject);
        logger.debug(`Recieved Response from master ->`, response);
        resolve(response);
      });

      connection.once("error", reject);

      logger.debug(`Sending request to master ->`, cmdArgs);
      connection.write(encodeToRespArray(cmdArgs.map(encodeToRespBulkString)));
    });
  });
}

function sendCommand(connection, ...cmdArgs) {
  logger.initSubContext({ replicaReqId: generateContextID() }, () => {
    logger.debug(`Sending request to master ->`, cmdArgs);
    connection.write(encodeToRespArray(cmdArgs.map(encodeToRespBulkString)));
  });
}

function inititateReplicaToMasterConnection() {
  logger.info(
    `Connecting Replica with address - "${serverDetails.host}:${serverDetails.port}" to master with address - "${serverDetails.masterInfo.host}:${serverDetails.masterInfo.port}"`,
  );

  const masterConnection = net.createConnection(
    {
      port: serverDetails.masterInfo.port,
      host: serverDetails.masterInfo.host,
    },
    () => {
      logger.initSubContext(
        { replica_host: serverDetails.host, replica_port: serverDetails.port },
        async () => {
          logger.info("connected with master successfully");

          const pingResponse = await sendCommandAndGetResponse(
            masterConnection,
            "PING",
          );

          const repl1stResponse = await sendCommandAndGetResponse(
            masterConnection,
            "REPLCONF",
            "listening-port",
            serverDetails.port,
          );

          const repl2ndResponse = await sendCommandAndGetResponse(
            masterConnection,
            "REPLCONF",
            "capa",
            "psync2",
          );

          const { replicationId, offset } = serverDetails.masterInfo;
          sendCommand(masterConnection, "PSYNC", replicationId, offset);
        },
      );
    },
  );

  masterConnection.on("end", () => {
    logger.info(
      `Replica with address - "${serverDetails.host}:${serverDetails.port}" is disconnected from master with address - "${serverDetails.masterInfo.host}:${serverDetails.masterInfo.port}"`,
    );
  });
}

module.exports = {
  inititateReplicaToMasterConnection,
};
