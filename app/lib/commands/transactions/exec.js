const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespArray } = require("../../respParser");

function execCommand() {
  const isMultiEnabled = redisLookup["isMultiEnabled"];

  if (!isMultiEnabled) {
    throw new Error("EXEC without MULTI");
  }

  redisLookup["isMultiEnabled"] = false;
  return encodeToRespArray([]);
}

module.exports = {
  execCommand,
};
