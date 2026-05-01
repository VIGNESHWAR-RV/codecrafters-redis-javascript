const { encodeToRespString } = require("../../respParser");
const { redisLookup } = require("../../inMemoryLookup");
const { logger } = require("../../contextualLogger");

function typeCommand(key) {
  const val = redisLookup[key];
  logger.info(typeof val);
  let res;
  switch (typeof val) {
    case "string":
      res = "string";
      break;
    default:
      res = "none";
  }

  return encodeToRespString(res);
}

module.exports = {
  typeCommand,
};
