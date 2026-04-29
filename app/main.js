const net = require("net");
const { randomUUID } = require("node:crypto");
const { AVAILABLE_COMMANDS } = require("./lib/commands");
const { logger } = require("./lib/contextualLogger");
const { decodeResp, encodeToRespError } = require("./lib/respParser");

// You can use print statements as follows for debugging, they'll be visible when running tests.
logger.info("Logs from your program will appear here!");

async function executeAvailableCommand(reqData) {
  const startTime = Date.now();
  try {
    const [reqType, ...reqDetails] = decodeResp(reqData);
    logger.info(reqType);
    const commandToBeExecuted = AVAILABLE_COMMANDS[reqType.toUpperCase()];
    if (!commandToBeExecuted) {
      throw new Error(`${reqType} - COMMAND NOT FOUND !!!`);
    }
    const res = await commandToBeExecuted(...reqDetails);
    return res.toString();
  } catch (err) {
    logger.error(err.message);
    const res = encodeToRespError(err);
    return res.toString();
  } finally {
    logger.info(`Time Taken for execution - ${Date.now() - startTime}`);
  }
}

// Uncomment the code below to pass the first stage
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    logger.initSubContext({ traceId: randomUUID() }, async () => {
      const res = await executeAvailableCommand(data);
      connection.write(res);
    });
  });
});

server.listen(6379, "127.0.0.1");
