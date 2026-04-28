const { redisLookup } = require("../inMemoryLookup/index");
const { encodeToRespInteger } = require("../respParser/index");

function lPushCommand(listName, ...values) {
  let list = redisLookup[listName];
  if (!list) {
    redisLookup[listName] = [];
    list = redisLookup[listName];
  }

  if (values?.length) {
    values.forEach((val)=>list.unshift(val));
  }
  
  const res = encodeToRespInteger(list.length);
  return res;
}

module.exports = {
  lPushCommand,
};
