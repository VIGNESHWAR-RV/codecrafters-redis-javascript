const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespArray,
} = require("../../respParser");

function xReadCommand(type, stream_key, id) {
  const { entries } = redisLookup?.[stream_key] ?? {};

  const [queryMilliSecondId, querySequenceId] = id?.split("-").map((el) => +el);

  const resRecords = [];
  entries?.forEach(({ id, args }) => {
    if (id[0] >= queryMilliSecondId && id[1] > querySequenceId) {
      const encodedRecordId = encodeToRespBulkString(id.join("-"));
      const encodedArgs = args.map(encodeToRespBulkString);
      resRecords.push([encodedRecordId, encodedArgs]);
    }
  });

  const res = [encodeToRespBulkString(stream_key), resRecords];

  console.log(encodeToRespArray(res).toString());
  return encodeToRespArray(res);
}

module.exports = {
  xReadCommand,
};
