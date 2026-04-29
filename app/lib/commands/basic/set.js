const { encodeToRespString } = require("../../respParser");
const { redisLookup } = require("../../inMemoryLookup");

function setCommand(key, value, expiryType, expiryValue) {
  const val = { value };
  if (expiryType) {
    if (expiryType.toUpperCase() === "EX") {
      expiryValue = +expiryValue * 1000;
    }
    val.expiryTimeStamp = Date.now() + +expiryValue;
  }
  redisLookup[key] = val;
  const res = encodeToRespString("OK");
  return res;
}

module.exports = {
  setCommand,
};
