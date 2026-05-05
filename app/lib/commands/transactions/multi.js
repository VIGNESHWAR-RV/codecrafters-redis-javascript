const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function multiCommand() {
  redisLookup["isMultiEnabled"] = true;
  return encodeToRespString("OK");
}

module.exports = {
  multiCommand,
};
