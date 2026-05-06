const {
  encodeToRespNull,
  encodeToRespBulkString,
} = require("../../respParser");
const { redisLookup } = require("../../inMemoryLookup");

function getCommand(key) {
  let { value, expiryTimeStamp } = redisLookup?.[key] ?? {};
  if (expiryTimeStamp && Date.now() >= expiryTimeStamp) {
    delete redisLookup[key];
    const res = encodeToRespNull();
    return res;
  }

  if (!value) {
    return encodeToRespNull();
  }

  const res = encodeToRespBulkString(value);
  return res;
}

module.exports = {
  getCommand,
};
