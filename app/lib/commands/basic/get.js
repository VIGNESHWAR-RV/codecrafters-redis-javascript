const {
  encodeToRespNull,
  encodeToRespBulkString,
} = require("../../respParser");
const { redisLookup } = require("../../inMemoryLookup");

function getCommand(key) {
  let { value = null, expiryTimeStamp } = redisLookup?.[key] ?? {};
  if (expiryTimeStamp && Date.now() >= expiryTimeStamp) {
    delete redisLookup[key];
    const res = encodeToRespNull();
    return res;
  }
  const res = encodeToRespBulkString(value);
  return res;
}

module.exports = {
  getCommand,
};
