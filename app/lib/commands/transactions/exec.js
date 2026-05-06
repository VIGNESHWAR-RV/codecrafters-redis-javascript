const { clientLookup } = require("../../inMemoryLookup");
const { encodeToRespArray, encodeToRespError } = require("../../respParser");

async function execCommand(clientId) {
  const { queuedCommands } = clientLookup[clientId];

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

  delete clientLookup.get(clientId).queuedCommands;
  return encodeToRespArray(finalResponse);
}

module.exports = {
  execCommand,
};
