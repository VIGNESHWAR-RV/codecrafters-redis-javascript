const net = require("net");
const { AVAILABLE_COMMANDS } = require("./lib/commands");
const { logger } = require("./lib/contextualLogger");
const { decodeResp, encodeToRespError } = require("./lib/respParser");

// You can use print statements as follows for debugging, they'll be visible when running tests.
logger.info("Logs from your program will appear here!");

function executeAvailableCommand(reqData) {
  try {
    const [reqType, ...reqDetails] = decodeResp(reqData);
    logger.info(reqType);
    const commandToBeExecuted = AVAILABLE_COMMANDS[reqType.toUpperCase()];
    if (!commandToBeExecuted) {
      throw new Error(`${reqType} - COMMAND NOT FOUND !!!`);
    }
    const res = commandToBeExecuted(...reqDetails);
    return res;
  } catch (err) {
    logger.error(err.stack);
    const res = encodeToRespError(err);
    return res;
  }
}

// Uncomment the code below to pass the first stage
const server = net.createServer((connection) => {
  logger.initSubContext({ serverStartTime: Date.now() }, () => {
    // Handle connection
    connection.on("data", (data) => {
      logger.initSubContext({}, () => {
        const res = executeAvailableCommand(data);
        connection.write(res);
      });
    });
  });
});

server.listen(6379, "127.0.0.1");
