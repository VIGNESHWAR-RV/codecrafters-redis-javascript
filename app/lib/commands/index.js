const { getCommand } = require("./get");
const { setCommand } = require("./set");
const { echoCommand } = require("./echo");
const { pingCommand } = require("./ping");
const { rPushCommand } = require("./rpush");
const { lRangeCommand } = require("./lrange");
const { lPushCommand } = require("./lpush");
const { lLenCommand } = require("./llen");
const { lPopCommand } = require("./lpop");
const { blPopCommand } = require("./blpop");

const AVAILABLE_COMMANDS = {
  PING: pingCommand,
  ECHO: echoCommand,

  GET: getCommand,
  SET: setCommand,

  RPUSH: rPushCommand,
  LRANGE: lRangeCommand,
  LPUSH: lPushCommand,
  LLEN: lLenCommand,
  LPOP: lPopCommand,
  BLPOP: blPopCommand,
};

module.exports = {
  AVAILABLE_COMMANDS,
};
