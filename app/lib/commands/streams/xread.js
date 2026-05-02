const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespArray,
} = require("../../respParser");

function xReadCommand(type, stream_key, id) {
  const { entries } = redisLookup?.[stream_key] ?? {};

  const [queryMilliSecondId, querySequenceId] = id?.split("-").map((el) => +el);

  const resRecords = [];
  const queriedRecord = entries?.forEach(({ id }) => {
    if (id[0] >= queryMilliSecondId && id[1] > querySequenceId) {
      const encodedRecordId = encodeToRespBulkString(
        queriedRecord.id.join("-"),
      );
      const encodedArgs = encodeToRespArray(
        queriedRecord.args.map(encodeToRespBulkString),
      );
      const resEntryRecord = encodeToRespArray([encodedRecordId, encodedArgs]);
      resRecords.push(resRecords);
    }
  });

  const res = [
    encodeToRespBulkString(stream_key),
    encodeToRespArray(resRecords),
  ];

  return encodeToRespArray(res);
}

module.exports = {
  xReadCommand,
};
