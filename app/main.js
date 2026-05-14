const net = require("net");
const { logger } = require("./lib/contextualLogger");
const { generateContextID } = require("./lib/utils/idUtil");
const { executeAvailableCommand } = require("./lib/commands");
const { clientLookup, serverDetails } = require("./lib/inMemoryLookup");
const { isNumber } = require("./lib/utils/typeUtil");
const { inititateReplicaToMasterConnection } = require("./lib/replica");

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
    serverDetails.masterInfo = {
      host,
      port: +port,
      replicationId: "?",
      offset: -1,
    };
  }
}

// Uncomment the code below to pass the first stage
const server = net.createServer((connection) => {
  const clientId = ++clientLookup.clientCounter;
  clientLookup[clientId] = { connection };
  // Handle connection
  connection.on("data", (data) => {
    logger.initSubContext(
      { traceId: generateContextID(), clientId },
      async () => {
        const res = await executeAvailableCommand(clientId, data);
        connection.write(res);
      },
    );
  });

  connection.on("end", () => {
    logger.info(`client with id - ${clientId} closed the connection`);
    delete clientLookup[clientId];
  });
});

server.listen(serverDetails.port, serverDetails.host);

if (serverDetails.isReplica) {
  inititateReplicaToMasterConnection();
}
