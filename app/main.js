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
} = require("./lib/respParser");
const { redisLookup, clientLookup } = require("./lib/inMemoryLookup");

// You can use print statements as follows for debugging, they'll be visible when running tests.
logger.info("Logs from your program will appear here!");

let clientCounter = 0;

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
      logger.debug("response details ->", res.toString());
      return res.toString();
    }
  } catch (err) {
    console.error(err.stack);
    const res = encodeToRespError(err);
    return res.toString();
  } finally {
    logger.info(`Time Taken for execution - ${Date.now() - startTime}`);
  }
}

// Uncomment the code below to pass the first stage
const server = net.createServer((connection) => {
  const clientId = ++clientCounter;
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

server.listen(6379, "127.0.0.1");
