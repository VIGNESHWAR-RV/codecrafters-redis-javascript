const { logger } = require("../../contextualLogger");
const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespBulkString } = require("../../respParser");

function xAddCommand(stream_key, entryId, ...args) {
  logger.info(`EntryId - ${entryId}`);
  let { entries } = redisLookup?.[stream_key] ?? {};
  if (!entries) {
    entries = [];
    redisLookup[stream_key] = { entries, type: "stream" };
  }

  console.log(`Entry Id 2 - ${entryId}`);
  let entryObj = { id: entryId };
  for (let i = 0; i < args.length; i + 2) {
    let key = args[i];
    let value = args[i + 1];
    entryObj[key] = value;
  }

  entries.push(entryObj);

  const res = encodeToRespBulkString(entryId);
  console.log(`res - ${res}`);
  return res;
}

module.exports = {
  xAddCommand,
};
