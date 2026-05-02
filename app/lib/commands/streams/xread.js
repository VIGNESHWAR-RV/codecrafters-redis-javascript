const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespArray,
} = require("../../respParser");

function xReadCommand(type, ...streamKeysAndIds) {
  const res = [];

  const stream_keys = [];
  const ids = [];

  const streamKeysLength = streamKeysAndIds.length / 2;
  for (let i = 0; i < streamKeysLength; i++) {
    stream_keys.push(streamKeysAndIds[i]);
    ids.push(streamKeysAndIds[i + streamKeysLength]);
  }

  for (let j = 0; j < stream_keys.length; j++) {
    const stream_key = stream_keys[j];
    const id = ids[j];

    const { entries } = redisLookup[stream_key];
    const [queryMilliSecondId, querySequenceId] = id
      ?.split("-")
      .map((el) => +el);

    const resRecords = [];
    entries?.forEach(({ id, args }) => {
      if (id[0] >= queryMilliSecondId && id[1] > querySequenceId) {
        const encodedRecordId = encodeToRespBulkString(id.join("-"));
        const encodedArgs = args.map(encodeToRespBulkString);
        resRecords.push([encodedRecordId, encodedArgs]);
      }
    });

    res.push([encodeToRespBulkString(stream_key), resRecords]);
  }
  return encodeToRespArray(res);
}

module.exports = {
  xReadCommand,
};
