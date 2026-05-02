const { logger } = require("../../contextualLogger");
const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespError,
} = require("../../respParser");

const ZERO_ERROR_MESSAGE = "The ID specified in XADD must be greater than 0-0";
const SMALLER_ERROR_MESSAGE =
  "The ID specified in XADD is equal or smaller than the target stream top item";

function xAddCommand(stream_key, entryId, ...args) {
  try {
    const [idMilliSecond, idSequence] = entryId.split("-").map((el) => +el);
    if (idMilliSecond === 0 && idSequence === 0) {
      throw new Error(ZERO_ERROR_MESSAGE);
    }

    let { entries } = redisLookup?.[stream_key] ?? {};

    if (!entries) {
      entries = [];
      redisLookup[stream_key] = { entries, type: "stream" };
    }

    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      const [lastEntryIdMilliSecond, lastEntryIdSequence] = lastEntry.id
        .split("-")
        .map((el) => +el);
      if (idMilliSecond < lastEntryIdMilliSecond) {
        throw new Error(SMALLER_ERROR_MESSAGE);
      } else if (
        idMilliSecond === lastEntryIdMilliSecond &&
        idSequence <= lastEntryIdSequence
      ) {
        throw new Error(SMALLER_ERROR_MESSAGE);
      }
    }

    let entryObj = { id: entryId };
    for (let i = 0; i < args.length; i = i + 2) {
      let key = args[i];
      let value = args[i + 1];
      entryObj[key] = value;
    }

    entries.push(entryObj);

    const res = encodeToRespBulkString(entryId);
    return res;
  } catch (err) {
    logger.error(err.stack);
    const res = encodeToRespError(err);
    return res;
  }
}

module.exports = {
  xAddCommand,
};
