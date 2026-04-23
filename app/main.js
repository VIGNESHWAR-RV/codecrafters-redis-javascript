const net = require("net");
const { AVAILABLE_COMMANDS } = require("./lib/commands");
const {
  decodeResp,
  encodeToRespNull,
} = require("./lib/respParser");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

function executeAvailableCommand(reqData) {
  const [reqtype, ...reqDetails] = decodeResp(reqData);
  const commandToBeExecuted = AVAILABLE_COMMANDS[reqtype.toUpperCase()];
  if (!commandToBeExecuted) {
    return encodeToRespNull();
  }
  const res = commandToBeExecuted(...reqDetails);
  return res;
}

// Uncomment the code below to pass the first stage
const server = net.createServer((connection) => {
  // Handle connection
  connection.on("data", (data) => {
    const res = executeAvailableCommand(data);
    connection.write(res);
  });
});

server.listen(6379, "127.0.0.1");
