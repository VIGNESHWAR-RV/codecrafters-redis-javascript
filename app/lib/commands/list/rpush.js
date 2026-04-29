const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespInteger } = require("../../respParser");
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
