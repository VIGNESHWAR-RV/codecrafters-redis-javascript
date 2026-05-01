const { encodeToRespString } = require("../../respParser");
const { redisLookup } = require("../../inMemoryLookup");

function typeCommand(key) {
  const val = redisLookup[key];

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
