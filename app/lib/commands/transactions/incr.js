const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespInteger } = require("../../respParser");

function incrCommand(key) {
  let val = redisLookup[key];

  if (!val) {
    val = { value: 0, type: "string" };
    redisLookup[key] = val;
  }

  val.value = +val.value + 1;

  return encodeToRespInteger(val.value);
}

module.exports = {
  incrCommand,
};
