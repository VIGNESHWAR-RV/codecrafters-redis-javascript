const { getCommand } = require("./basic/get");
const { setCommand } = require("./basic/set");
const { echoCommand } = require("./basic/echo");
const { pingCommand } = require("./basic/ping");
const { typeCommand } = require("./basic/type");

// lists
const { rPushCommand } = require("./list/rpush");
const { lRangeCommand } = require("./list/lrange");
const { lPushCommand } = require("./list/lpush");
const { lLenCommand } = require("./list/llen");
const { lPopCommand } = require("./list/lpop");
const { blPopCommand } = require("./list/blpop");

// streams
const { xAddCommand } = require("./streams/xadd");
const { xRangeCommand } = require("./streams/xrange");
const { xReadCommand } = require("./streams/xread");

// transactions
const { incrCommand } = require("./transactions/incr");

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

  XADD: xAddCommand,
  XRANGE: xRangeCommand,
  XREAD: xReadCommand,

  INCR: incrCommand,
};

module.exports = {
  AVAILABLE_COMMANDS,
};
