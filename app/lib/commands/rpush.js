const { redisLookup } = require("../inMemoryLookup/index");
const { encodeToRespInteger } = require("../respParser/index");

function rPushCommand(listName, value) {
  let list = redisLookup[listName];
  if (!list) {
    redisLookup[listName] = [];
    list = redisLookup[listName];
  }

  list.push(value);
  const res = encodeToRespInteger(list.length);
  return res;
}

module.exports = {
  rPushCommand,
};
