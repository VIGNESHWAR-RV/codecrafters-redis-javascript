const { logger } = require("../../contextualLogger");
const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespInteger, encodeToRespError } = require("../../respParser");
const { isNumber } = require("../../utils/typeUtil");

function incrCommand(key) {
  try {
    let val = redisLookup[key];

    if (!val) {
      val = { value: 0, type: "string" };
      redisLookup[key] = val;
    }

    if (!isNumber(val.value)) {
      throw new Error("value is not an integer or out of range");
    }
    val.value = +val.value + 1;

    return encodeToRespInteger(val.value);
  } catch (err) {
    logger.error(err.stack);
    const res = encodeToRespError(err);
    return res;
  }
}

module.exports = {
  incrCommand,
};
