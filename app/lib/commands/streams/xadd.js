const { logger } = require("../../contextualLogger");
const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespError,
} = require("../../respParser");

const ZERO_ERROR_MESSAGE = "The ID specified in XADD must be greater than 0-0";
const SMALLER_ERROR_MESSAGE =
  "The ID specified in XADD is equal or smaller than the target stream top item";

function xAddCommand(stream_key, entryId, ...args) {
  try {
    let { entries } = redisLookup?.[stream_key] ?? {};

    if (!entries) {
      entries = [];
      redisLookup[stream_key] = { entries, type: "stream" };
    }

    const lastEntry = entries?.[entries.length - 1];

    const [lastEntryIdMilliSecond, lastEntryIdSequence] = lastEntry?.id ?? [
      0, 0,
    ];

    let [idMilliSecond, idSequence] = entryId.split("-");
    if (idMilliSecond === "*") {
      idMilliSecond = lastEntryIdMilliSecond;
    }
    if (idSequence === "*") {
      if (idMilliSecond !== "0") {
        idSequence = 0;
      } else {
        idSequence = lastEntryIdSequence + 1;
      }
    }

    if (idMilliSecond === "0" && idSequence === "0") {
      throw new Error(ZERO_ERROR_MESSAGE);
    } else if (+idMilliSecond < lastEntryIdMilliSecond) {
      throw new Error(SMALLER_ERROR_MESSAGE);
    } else if (
      +idMilliSecond === lastEntryIdMilliSecond &&
      +idSequence <= lastEntryIdSequence
    ) {
      throw new Error(SMALLER_ERROR_MESSAGE);
    }

    let entryObj = { id: [+idMilliSecond, +idSequence] };
    for (let i = 0; i < args.length; i = i + 2) {
      let key = args[i];
      let value = args[i + 1];
      entryObj[key] = value;
    }

    entries.push(entryObj);

    const res = encodeToRespBulkString(entryObj.id.join("-"));
    return res;
  } catch (err) {
    console.error(err.stack);
    const res = encodeToRespError(err);
    return res;
  }
}

module.exports = {
  xAddCommand,
};
