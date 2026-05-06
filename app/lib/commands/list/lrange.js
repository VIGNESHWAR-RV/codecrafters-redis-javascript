const { logger } = require("../../contextualLogger");
const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespArray,
  encodeToRespBulkString,
} = require("../../respParser");

function lRangeCommand(clientId, listName, startIndex, endIndex) {
  logger.info(startIndex, endIndex);

  startIndex = +startIndex;
  endIndex = +endIndex;

  const { list } = redisLookup?.[listName] ?? {};

  if (!list) {
    return encodeToRespArray();
  }

  if (startIndex < 0) {
    // converting to positive index
    startIndex = list.length + startIndex;
    // start index could be larger than the list length and in negative value
    if (startIndex < 0) {
      startIndex = 0;
    }
  } else if (startIndex >= list.length) {
    return encodeToRespArray();
  }

  if (endIndex < 0) {
    // converting to positive index
    endIndex = list.length + endIndex;
  } else if (endIndex > list.length) {
    endIndex = list.length;
  }

  if (startIndex > endIndex) {
    return encodeToRespArray();
  }

  // +1 for end index value inclusivity
  const rangeArr = list
    .slice(startIndex, endIndex + 1)
    .map(encodeToRespBulkString);

  const res = encodeToRespArray(rangeArr);

  return res;
}

module.exports = {
  lRangeCommand,
};
