const { encodeToRespString } = require("../../respParser");
const { redisLookup } = require("../../inMemoryLookup");
const { logger } = require("../../contextualLogger");

function typeCommand(key) {
  const { value, type = "none" } = redisLookup?.[key] ?? {};
  return encodeToRespString(type);
}

module.exports = {
  typeCommand,
};
