const { getCommand } = require("./get");
const { setCommand } = require("./set");
const { echoCommand } = require("./echo");
const { pingCommand } = require("./ping");
const { rPushCommand } = require("./rpush");
const { lRangeCommand } = require("./lrange");

const AVAILABLE_COMMANDS = {
  PING: pingCommand,
  ECHO: echoCommand,
  GET: getCommand,
  SET: setCommand,
  RPUSH: rPushCommand,
  LRANGE: lRangeCommand,
};

module.exports = {
  AVAILABLE_COMMANDS,
};
