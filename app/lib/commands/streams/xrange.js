const { logger } = require("../../contextualLogger");
const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespArray,
} = require("../../respParser");

function xRangeCommand(clientId, stream_key, start = "-", end = "+") {
  let { entries } = redisLookup?.[stream_key] ?? {};

  const res = [];
  const [startMilliSecondId, startSequenceId] =
    start !== "-" ? start.split("-").map((el) => +el) : [0, 1];
  const [endMilliSecondId, endSequenceId] =
    end !== "+"
      ? end.split("-").map((el) => +el)
      : entries[entries.length - 1].id;

  logger.debug(
    entries.length,
    startMilliSecondId,
    startSequenceId,
    endMilliSecondId,
    endSequenceId,
  );

  for (let i = 0; i < entries.length; i++) {
    const { id, args } = entries[i];
    const [entryMilliSecondId, entrySequenceId] = id;
    if (
      entryMilliSecondId >= startMilliSecondId &&
      entrySequenceId >= startSequenceId
    ) {
      let resEntry = [];
      const encodedId = encodeToRespBulkString(id.join("-"));
      const encodedArgs = args.map(encodeToRespBulkString);
      resEntry.push(encodedId, encodedArgs);
      res.push(encodeToRespArray(resEntry));
    }

    if (
      entryMilliSecondId >= endMilliSecondId &&
      entrySequenceId >= endSequenceId
    ) {
      break;
    }
  }

  return encodeToRespArray(res);
}

module.exports = {
  xRangeCommand,
};
