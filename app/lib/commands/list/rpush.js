const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespInteger } = require("../../respParser");
const { notifyBlPopObservers } = require("./blpop");

function rPushCommand(clientId, listName, ...values) {
  let { list } = redisLookup?.[listName] ?? {};
  if (!list) {
    list = [];
    redisLookup[listName] = { list, type: "list" };
  }

  list.push(...values);
  notifyBlPopObservers(list);
  const res = encodeToRespInteger(list.length);
  return res;
}

module.exports = {
  rPushCommand,
};
