const net = require("net");
const { randomUUID } = require("node:crypto");
const { AVAILABLE_COMMANDS } = require("./lib/commands");
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
    const { queuedCommands } = clientLookup.get(clientId);
    if (queuedCommands && reqType.toUpperCase() !== "EXEC") {
      queuedCommands.push({ commandToBeExecuted, reqDetails });
      const res = encodeToRespString("QUEUED");
      return res.toString();
    } else {
      const res = await commandToBeExecuted(clientId, ...reqDetails);
      console.log("response details ->", res.toString());
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
  clientLookup.set(clientId, { connection });
  // Handle connection
  connection.on("data", (data) => {
    logger.initSubContext({ traceId: randomUUID(), clientId }, async () => {
      const res = await executeAvailableCommand(clientId, data);
      connection.write(res);
    });
  });

  connection.on("end", () => {
    logger.info(`client with id - ${clientId} closed the connection`);
    clientLookup.delete(clientId);
  });
});

server.listen(6379, "127.0.0.1");
