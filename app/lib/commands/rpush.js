const { redisLookup } = require("../inMemoryLookup/index");
const { encodeToRespInteger } = require("../respParser/index");
const { notifyBlPopObservers } = require("./blpop");

function rPushCommand(listName, ...values) {
  let list = redisLookup[listName];
  if (!list) {
    redisLookup[listName] = [];
    list = redisLookup[listName];
  }

  list.push(...values);
  notifyBlPopObservers(list);
  const res = encodeToRespInteger(list.length);
  return res;
}

module.exports = {
  rPushCommand,
};
