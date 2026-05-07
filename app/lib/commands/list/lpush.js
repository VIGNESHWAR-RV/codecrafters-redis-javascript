const { redisLookup } = require("../../inMemoryLookup");
const { encodeToRespInteger } = require("../../respParser");
const { notifyBlPopObservers } = require("./blpop");

function lPushCommand(clientId, listName, ...values) {
  let { list } = redisLookup?.[listName] ?? {};
  if (!list) {
    list = [];
    redisLookup[listName] = { list, type: "list" };
  }

  if (values?.length) {
    values.forEach((val) => list.unshift(val));
    notifyBlPopObservers(listName);
  }

  const res = encodeToRespInteger(list.length);
  return res;
}

module.exports = {
  lPushCommand,
};
