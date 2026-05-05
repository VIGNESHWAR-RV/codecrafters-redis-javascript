const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespInteger } = require("../../respParser");


function incrCommand(key) {
  const val = redisLookup[key];

  val.value = +value.value + 1;

  return encodeToRespInteger(val.value);
}

module.exports = {
    incrCommand
}