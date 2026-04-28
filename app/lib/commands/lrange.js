const { logger } = require("../contextualLogger");
const { redisLookup } = require("../inMemoryLookup/index");
const {
  encodeToRespArray,
  encodeToRespBulkString,
} = require("../respParser/index");

function lRangeCommand(listName, startIndex, endIndex) {
  logger.info(startIndex, endIndex);

  startIndex = +startIndex;
  endIndex = +endIndex;

  const list = redisLookup[listName];

  if (!list) {
    return encodeToRespArray();
  }

  if (startIndex < 0) {
    startIndex = list.length + startIndex;
    if (startIndex < 0) {
      startIndex = 0;
    }
  }

  if (endIndex < 0) {
    endIndex = list.length + endIndex;
  }

  if (startIndex > endIndex) {
    return encodeToRespArray();
  }

  if (startIndex >= list.length) {
    return encodeToRespArray();
  }

  if (endIndex > list.length) {
    endIndex = list.length;
  }

  // for end index value inclusivity
  endIndex++;

  const rangeArr = list.slice(startIndex, endIndex).map(encodeToRespBulkString);

  const res = encodeToRespArray(rangeArr);

  return res;
}

module.exports = {
  lRangeCommand,
};
