const { redisLookup } = require("../inMemoryLookup");
const { encodeToRespInteger } = require("../respParser");
const { notifyBlPopObservers } = require("./blpop");

function lPushCommand(listName, ...values) {
  let list = redisLookup[listName];
  if (!list) {
    redisLookup[listName] = [];
    list = redisLookup[listName];
  }

  if (values?.length) {
    values.forEach((val) => list.unshift(val));
    notifyBlPopObservers(list);
  }

  const res = encodeToRespInteger(list.length);
  return res;
}

module.exports = {
  lPushCommand,
};
