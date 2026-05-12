const net = require("net");
const { randomUUID } = require("node:crypto");
const {
  AVAILABLE_COMMANDS,
  MULTI_EXCEPTION_COMMANDS,
} = require("./lib/commands");
const { logger } = require("./lib/contextualLogger");
const {
  decodeResp,
  encodeToRespError,
  encodeToRespString,
  encodeToRespArray,
  encodeToRespBulkString,
} = require("./lib/respParser");
const {
  redisLookup,
  clientLookup,
  serverDetails,
} = require("./lib/inMemoryLookup");
const { isNumber } = require("./lib/utils/typeUtil");

// You can use print statements as follows for debugging, they'll be visible when running tests.
logger.info("Logs from your program will appear here!");

const [nodePath, fileDir, ...args] = process.argv;

if (args.length) {
  logger.debug("arguments receieved -> ", ...args);
}

for (let i = 0; i < args.length; i++) {
  const argVal = args[i];
  if (argVal === "--port" && isNumber(args[i + 1])) {
    serverDetails.port = +args[i + 1];
  }
  if (argVal === "--replicaof") {
    serverDetails.isReplica = true;
    const [host, port] = args[i + 1].split(" ");
    serverDetails.masterInfo = { host, port: +port };
  }
}

async function executeAvailableCommand(clientId, reqData) {
  const startTime = Date.now();
  try {
    const [reqType, ...reqDetails] = decodeResp(reqData);
    logger.info(reqType);
    logger.debug(`request details ->`, reqDetails);
    const commandToBeExecuted = AVAILABLE_COMMANDS[reqType.toUpperCase()];
    if (!commandToBeExecuted) {
      throw new Error(`${reqType} - COMMAND NOT FOUND !!!`);
    }
    const { queuedCommands } = clientLookup[clientId];
    if (queuedCommands && !MULTI_EXCEPTION_COMMANDS[reqType.toUpperCase()]) {
      queuedCommands.push({ commandToBeExecuted, reqDetails });
      const res = encodeToRespString("QUEUED");
      logger.debug("response details ->", res.toString());
      return res.toString();
    } else {
      const res = await commandToBeExecuted(clientId, ...reqDetails);
      logger.debug("response details ->", JSON.stringify(res.toString()));
      return res.toString();
    }
  } catch (err) {
    logger.error(err.stack);
    const res = encodeToRespError(err);
    return res.toString();
  } finally {
    logger.info(`Time Taken for execution - ${Date.now() - startTime}`);
  }
}

// Uncomment the code below to pass the first stage
const server = net.createServer((connection) => {
  const clientId = ++clientLookup.clientCounter;
  clientLookup[clientId] = { connection };
  // Handle connection
  connection.on("data", (data) => {
    logger.initSubContext({ traceId: randomUUID(), clientId }, async () => {
      const res = await executeAvailableCommand(clientId, data);
      connection.write(res);
    });
  });

  connection.on("end", () => {
    logger.info(`client with id - ${clientId} closed the connection`);
    delete clientLookup[clientId];
  });
});

server.listen(serverDetails.port, serverDetails.ip);

if (serverDetails.isReplica) {
  async function sendCommand(connection, ...cmdArgs) {
    return new Promise((resolve, reject) => {
      logger.initSubContext({ masterReqId: randomUUID() }, () => {
        connection.once("data", (data) => {
          const response = decodeResp(data);
          connection.removeListener("error", reject);
          logger.debug(`Recieved Response from master ->`, response);
          resolve(response);
        });

        connection.once("error", reject);

        logger.debug(`Sending request to master ->`, cmdArgs);
        connection.write(
          encodeToRespArray(cmdArgs.map(encodeToRespBulkString)),
        );
      });
    });
  }

  const masterConnection = net.createConnection(
    {
      port: serverDetails.masterInfo.port,
      host: serverDetails.masterInfo.host,
    },
    logger.initSubContext(
      { replica_host: serverDetails.host, replica_port: serverDetails.port },
      async () => {
        logger.info("connected with master ✅");

        const pingResponse = await sendCommand(masterConnection, "PING");

        const repl1stResponse = await sendCommand(
          masterConnection,
          "REPLCONF",
          "listening-port",
          serverDetails.port,
        );

        const repl2ndResponse = await sendCommand(
          masterConnection,
          "REPLCONF",
          "capa",
          "psync2",
        );
      },
    ),
  );

  masterConnection.on("end", () => {});
}
