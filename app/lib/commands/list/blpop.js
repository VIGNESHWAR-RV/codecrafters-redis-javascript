const { logger } = require("../../contextualLogger");
const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespArray,
  encodeToRespNullArray,
} = require("../../respParser");

const observersLookup = new Map();

function notifyBlPopObservers(listName) {
  setImmediate(() => {
    const { list } = redisLookup?.[listName] ?? {};
    if (list && list.length) {
      const callbacks = observersLookup.get(list);
      if (callbacks?.length) {
        const removedValue = list.shift();
        redisLookup[listName].updatedAt = Date.now();
        const callback = callbacks.shift();
        callback(removedValue);
        if (!callbacks.length) {
          observersLookup.delete(list);
        }
        if (list.length) {
          notifyObservers(list);
        }
      } else {
        observersLookup.delete(list);
      }
    }
  });
}

async function blPopCommand(clientId, listName, timer = 0) {
  try {
    timer = +timer;
    let { list } = redisLookup?.[listName] ?? {};

    if (!list) {
      list = [];
      redisLookup[listName] = { list, type: "list" };
    }

    let result;

    if (!list[0]) {
      let observersList = observersLookup.get(list);
      if (!observersList) {
        observersList = [];
        observersLookup.set(list, observersList);
      }
      result = await new Promise((res, rej) => {
        let timerId;

        const callback = (removedValue) => {
          res([listName, removedValue]);
          if (timerId) {
            clearTimeout(timerId);
          }
        };
        observersList.push(callback);

        if (timer) {
          logger.info(`setting timer - ${timer}`);
          timerId = setTimeout(() => {
            const index = observersList.indexOf(callback);
            if (index > -1) observersList.splice(index, 1);
            rej(new Error(`client given wait time is over - ${timer} seconds`));
          }, timer * 1000);
        }
      });
    } else {
      const removedValue = list.shift();
      redisLookup[listName].updatedAt = Date.now();
      result = [listName, removedValue];
    }

    const res = encodeToRespArray(result.map(encodeToRespBulkString));
    return res;
  } catch (err) {
    logger.error(err.stack);
    const res = encodeToRespNullArray();
    return res;
  }
}

module.exports = {
  blPopCommand,
  notifyBlPopObservers,
};
