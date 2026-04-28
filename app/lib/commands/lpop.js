const { logger } = require("../contextualLogger");
const { redisLookup } = require("../inMemoryLookup/index");
const { encodeToRespBulkString } = require("../respParser/index");

function lPopCommand(listName) {
  const list = redisLookup[listName];

  if (!list) {
    return encodeToRespBulkString(null);
  }

  const val = list.shift();
  const res = encodeToRespBulkString(val);

  return res;
}

module.exports = {
  lPopCommand,
};
