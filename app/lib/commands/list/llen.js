const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespInteger } = require("../../respParser");

function lLenCommand(listName, ...values) {
  let list = redisLookup[listName];
  if (!list) {
    const res = encodeToRespInteger(0);
    return res;
  }

  const res = encodeToRespInteger(list.length);
  return res;
}

module.exports = {
  lLenCommand,
};
