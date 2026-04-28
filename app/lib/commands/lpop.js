const { logger } = require("../contextualLogger");
const { redisLookup } = require("../inMemoryLookup/index");
const {
  encodeToRespBulkString,
  encodeToRespArray,
} = require("../respParser/index");

function lPopCommand(listName, elementsCount = 1) {
  elementsCount = +elementsCount;
  const list = redisLookup[listName];

  if (!list) {
    return encodeToRespBulkString(null);
  }

  if (elementsCount > list.length) {
    elementsCount = list.length;
  }

  const removedValues = [];

  for (let i = 0; i < elementsCount; i++) {
    const removedValue = list.shift();
    removedValues.push(removedValue);
  }

  if (!removedValues.length) {
    return encodeToRespBulkString(null);
  }

  if (removedValues.length === 1) {
    const res = encodeToRespBulkString(removedValues[0]);
    return res;
  }

  const res = encodeToRespArray(removedValues);
  return res;
}

module.exports = {
  lPopCommand,
};
