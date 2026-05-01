const { getCommand } = require("./basic/get");
const { setCommand } = require("./basic/set");
const { echoCommand } = require("./basic/echo");
const { pingCommand } = require("./basic/ping");
const { typeCommand } = require("./basic/type");

const { rPushCommand } = require("./list/rpush");
const { lRangeCommand } = require("./list/lrange");
const { lPushCommand } = require("./list/lpush");
const { lLenCommand } = require("./list/llen");
const { lPopCommand } = require("./list/lpop");
const { blPopCommand } = require("./list/blpop");

const AVAILABLE_COMMANDS = {
  PING: pingCommand,
  ECHO: echoCommand,

  GET: getCommand,
  SET: setCommand,
  TYPE: typeCommand,

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
