const net = require("net");
const { logger } = require("../contextualLogger");
const { generateContextID } = require("../utils/idUtil");
const {
  decodeResp,
  encodeToRespArray,
  encodeToRespBulkString,
} = require("../respParser");
const { clientLookup, serverDetails } = require("../inMemoryLookup");
const { executeAvailableCommand } = require("../commands");

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
      connection.write(
        encodeToRespArray(cmdArgs.map(encodeToRespBulkString)).toString(),
      );
    });
  });
}

async function handleFullReSync(connection) {
  return new Promise((resolve, reject) => {
    logger.initSubContext({ replicaReqId: generateContextID() }, () => {
      connection.once("data", (data) => {
        connection.removeListener("error", reject);
        resolve();
      });

      connection.once("error", reject);

      const cmdArgs = ["PSYNC", "?", "-1"];
      logger.debug(`Sending request to master ->`, cmdArgs);
      connection.write(
        encodeToRespArray(cmdArgs.map(encodeToRespBulkString)).toString(),
      );
    });
  });
}

function inititateReplicaToMasterConnection() {
  logger.info(
    `Connecting Replica "${serverDetails.host}:${serverDetails.port}" to master "${serverDetails.masterInfo.host}:${serverDetails.masterInfo.port}"`,
  );

  const masterConnection = net.createConnection(
    {
      port: serverDetails.masterInfo.port,
      host: serverDetails.masterInfo.host,
    },
    () => {
      // adding master also to client list
      // problem⚠️ ( as we want to use the commands folder for replica as well, we need clientId )
      const clientId = ++clientLookup.clientCounter;
      clientLookup[clientId] = { connection: masterConnection, isMaster: true };

      logger.initSubContext(
        {
          isReplica: true,
          replica_host: serverDetails.host,
          replica_port: serverDetails.port,
          masterClientId: clientId,
        },
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

          await handleFullReSync(masterConnection);

          masterConnection.on("data", (data) => {
            logger.initSubContext(
              { cmdSyncReqId: generateContextID() },
              async () => {
                logger.debug(
                  `Incoming Sync Request -> `,
                  JSON.stringify(data.toString()),
                );
                await executeAvailableCommand(data);
              },
            );
          });

          masterConnection.on("end", () => {
            logger.info(
              `Replica is disconnected from master - "${serverDetails.masterInfo.host}:${serverDetails.masterInfo.port}"`,
            );
            delete clientLookup[clientId];
          });
        },
      );
    },
  );
}

module.exports = {
  inititateReplicaToMasterConnection,
};
