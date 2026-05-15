const { logger } = require("../contextualLogger");
const {
  decodeResp,
  encodeToRespString,
  encodeToRespError,
} = require("../respParser");
const { clientLookup } = require("../inMemoryLookup");

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
const { multiCommand } = require("./transactions/multi");
const { execCommand } = require("./transactions/exec");
const { discardCommand } = require("./transactions/discard");

// optimistic locking
const { watchCommand } = require("./optimistic_lokcing/watch");
const { unWatchCommand } = require("./optimistic_lokcing/unwatch");

// Replication
const { infoCommand } = require("./replication/info");
const { replConfCommand } = require("./replication/replconf");
const { pSyncCommand, notifyUpdatesToReplica } = require("./replication/psync");

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
  MULTI: multiCommand,
  EXEC: execCommand,
  DISCARD: discardCommand,

  WATCH: watchCommand,
  UNWATCH: unWatchCommand,

  INFO: infoCommand,
  REPLCONF: replConfCommand,
  PSYNC: pSyncCommand,
};

const MULTI_EXCEPTION_COMMANDS = {
  MULTI: multiCommand,
  EXEC: execCommand,
  DISCARD: discardCommand,
  WATCH: watchCommand,
  UNWATCH: unWatchCommand,
  INFO: infoCommand,
  REPLCONF: replConfCommand,
  PSYNC: pSyncCommand,
};

const COMMANDS_TO_BE_NOTIFIED_TO_REPLICA = {
  SET: setCommand,
};

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
    const { queuedCommands } = clientLookup[clientId];
    if (queuedCommands && !MULTI_EXCEPTION_COMMANDS[reqType.toUpperCase()]) {
      queuedCommands.push({ commandToBeExecuted, reqDetails });
      const stringifiedResponse = encodeToRespString("QUEUED").toString();
      logger.debug("response details ->", stringifiedResponse);
      return stringifiedResponse;
    } else {
      const res = await commandToBeExecuted(clientId, ...reqDetails);

      if (COMMANDS_TO_BE_NOTIFIED_TO_REPLICA[reqType.toUpperCase()]) {
        notifyUpdatesToReplica(reqType, ...reqDetails);
      }

      if (res) {
        const stringifiedResponse = res.toString();
        logger.debug(
          "response details ->",
          JSON.stringify(stringifiedResponse),
        );
        return stringifiedResponse;
      }
    }
  } catch (err) {
    logger.error(err.stack);
    const res = encodeToRespError(err);
    return res.toString();
  } finally {
    logger.info(`Time Taken for execution - ${Date.now() - startTime}`);
  }
}

module.exports = {
  executeAvailableCommand,
};
