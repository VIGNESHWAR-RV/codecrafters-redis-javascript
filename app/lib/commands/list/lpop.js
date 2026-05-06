const { logger } = require("../../contextualLogger");
const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespArray,
} = require("../../respParser");

function lPopCommand(clientId, listName, elementsCount = 1) {
  elementsCount = +elementsCount;
  const { list } = redisLookup?.[listName] ?? {};

  if (!list) {
    return encodeToRespBulkString(null);
  }

  if (elementsCount > list.length) {
    elementsCount = list.length;
  }

  const removedValues = [];

  for (let i = 0; i < elementsCount; i++) {
    const removedValue = list.shift();
    removedValues.push(encodeToRespBulkString(removedValue));
  }

  if (!removedValues.length) {
    return encodeToRespBulkString(null);
  }

  if (removedValues.length === 1) {
    return removedValues[0];
  }

  const res = encodeToRespArray(removedValues);
  return res;
}

module.exports = {
  lPopCommand,
};
