const { getCommand } = require("./get");
const { setCommand } = require("./set");
const { echoCommand } = require("./echo");
const { pingCommand } = require("./ping");
const { rPushCommand } = require('./rpush');

const AVAILABLE_COMMANDS = {
  PING: pingCommand,
  ECHO: echoCommand,
  GET: getCommand,
  SET: setCommand,
  RPUSH: rPushCommand
};

module.exports = {
  AVAILABLE_COMMANDS,
};
