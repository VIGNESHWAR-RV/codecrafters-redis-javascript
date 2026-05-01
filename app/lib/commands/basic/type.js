const { encodeToRespString } = require("../../respParser");
const { redisLookup } = require("../../inMemoryLookup");
const { logger } = require("../../contextualLogger");

function typeCommand(key) {
  const { value } = redisLookup?.[key] ?? {};
  let res;
  switch (typeof value) {
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
