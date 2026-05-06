const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function multiCommand() {
  redisLookup.multi = [];
  return encodeToRespString("OK");
}

module.exports = {
  multiCommand,
};
