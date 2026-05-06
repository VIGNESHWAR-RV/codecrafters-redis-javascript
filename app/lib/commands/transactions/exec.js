const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespArray, encodeToRespError } = require("../../respParser");

async function execCommand() {
  const queuedCommands = redisLookup.multi;

  if (!queuedCommands) {
    throw new Error("EXEC without MULTI");
  }

  const finalResponse = [];
  for (let i = 0; i < queuedCommands.length; i++) {
    const { commandToBeExecuted, reqDetails } = queuedCommands[i];
    try {
      const res = await commandToBeExecuted(...reqDetails);
      finalResponse.push(res);
    } catch (err) {
      logger.error(err.stack);
      const res = encodeToRespError();
      finalResponse.push(res);
    }
  }

  delete redisLookup.multi;
  return encodeToRespArray(finalResponse);
}

module.exports = {
  execCommand,
};
