const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespArray,
} = require("../../respParser");

function xRangeCommand(stream_key, start, end = -1) {
  let { entries } = redisLookup?.[stream_key] ?? {};

  const res = [];
  const [startMilliSecondId, startSequenceId] = start
    ?.split("-")
    ?.map((el) => +el) ?? [0, 1];
  const [endMilliSecondId, endSequenceId] =
    end?.split("-")?.map((el) => +el) ?? entries[entries.length - 1].id;

  console.log(
    startMilliSecondId,
    startSequenceId,
    endMilliSecondId,
    endSequenceId,
    entries.length,
  );

  for (let i = 0; i < entries.length; i++) {
    const { id, args } = entries[0];
    const [entryMilliSecondId, entrySequenceId] = id;
    console.log(entryMilliSecondId, entrySequenceId);
    if (
      entryMilliSecondId >= startMilliSecondId &&
      entrySequenceId >= startSequenceId
    ) {
      let resEntry = [];
      const endcodedId = encodeToRespBulkString(id.join("-"));
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
