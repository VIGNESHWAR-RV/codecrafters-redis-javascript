const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespArray,
} = require("../../respParser");

function xReadCommand(type, stream_key, id) {
  const { entries } = redisLookup?.[stream_key] ?? {};

  const [queryMilliSecondId, querySequenceId] = id?.split("-").map((el) => +el);
  const queriedRecord = entries?.find(
    ({ id }) => id[0] === queryMilliSecondId && id[1] === querySequenceId,
  );
  const encodedRecordId = encodeToRespBulkString(queriedRecord.id.join("-"));
  const encodedArgs = encodeToRespArray(
    queriedRecord.args.map(encodeToRespBulkString),
  );
  const resEntryRecord = encodeToRespArray([encodedRecordId, encodedArgs]);
  const res =
    encodeToRespArray[
      (encodeToRespBulkString(stream_key), encodeToRespArray[resEntryRecord])
    ];
  return encodeToRespArray(res);
}

module.exports = {
  xReadCommand,
};
