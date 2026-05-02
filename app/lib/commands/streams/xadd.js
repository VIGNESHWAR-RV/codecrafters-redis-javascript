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
    let { entries } = redisLookup?.[stream_key] ?? {};
    if (!entries) {
      entries = [];
      redisLookup[stream_key] = { entries, type: "stream" };
    }

    let [milliSecondId, sequenceId = "*"] = entryId.split("-");

    const lastEntry = entries?.[entries.length - 1];
    const [lastMilliSecondId, lastSequenceId] = lastEntry?.id ?? [0, 0];

    // convert asterik characters
    if (milliSecondId === "*") {
      milliSecondId = Date.now();
    }
    milliSecondId = +milliSecondId;

    if (sequenceId === "*") {
      if (!lastEntry && milliSecondId === 0) {
        sequenceId = 1;
      } else if (lastEntry && milliSecondId === lastMilliSecondId) {
        sequenceId = lastSequenceId + 1;
      } else {
        sequenceId = 0;
      }
    }
    sequenceId = +sequenceId;

    // check conditions
    if (milliSecondId === 0 && sequenceId === 0) {
      throw new Error(ZERO_ERROR_MESSAGE);
    } else if (lastEntry && milliSecondId < lastMilliSecondId) {
      throw new Error(SMALLER_ERROR_MESSAGE);
    } else if (
      lastEntry &&
      +milliSecondId === lastMilliSecondId &&
      +sequenceId <= lastSequenceId
    ) {
      throw new Error(SMALLER_ERROR_MESSAGE);
    }

    let entryObj = { id: [milliSecondId, sequenceId], args };


    entries.push(entryObj);

    const res = encodeToRespBulkString(entryObj.id.join("-"));
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
