const { clientLookup, redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespArray,
  encodeToRespError,
  encodeToRespNullArray,
} = require("../../respParser");

async function execCommand(clientId) {
  const clientData = clientLookup[clientId];
  const { queuedCommands, watchedKeys } = clientData;

  if (!queuedCommands) {
    throw new Error("EXEC without MULTI");
  }

  if (watchedKeys && Object.keys(watchedKeys).length) {
    let watchedKeyList = Object.keys(watchedKeys);

    for (let i = 0; i < watchedKeyList.length; i++) {
      const key = watchedKeyList[i];
      const { updatedAt = null } = redisLookup?.[key] ?? {};
      if (updatedAt !== watchedKeys[key]) {
        delete watchedKeys[key];
        delete clientData.queuedCommands;
        return encodeToRespNullArray();
      }
    }
  }

  const finalResponse = [];
  for (let i = 0; i < queuedCommands.length; i++) {
    const { commandToBeExecuted, reqDetails } = queuedCommands[i];
    try {
      const res = await commandToBeExecuted(clientId, ...reqDetails);
      finalResponse.push(res);
    } catch (err) {
      logger.error(err.stack);
      const res = encodeToRespError();
      finalResponse.push(res);
    }
  }

  delete clientData.queuedCommands;
  return encodeToRespArray(finalResponse);
}

module.exports = {
  execCommand,
};
