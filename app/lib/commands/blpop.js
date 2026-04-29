const { logger } = require("../contextualLogger");
const { redisLookup } = require("../inMemoryLookup/index");
const {
  encodeToRespBulkString,
  encodeToRespArray,
  encodeToRespNullArray,
} = require("../respParser/index");

const observersLookup = new Map();

function notifyBlPopObservers(list) {
  if (list.length) {
    const callbacks = observersLookup.get(list);
    if (callbacks.length) {
      const removedValue = list.shift();
      logger.debug(`calling longest waiting mutation observer`);
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
}

async function blPopCommand(listName, timer = 0) {
  try {
    timer = +timer;
    let list = redisLookup[listName];

    if (!list) {
      list = [];
      redisLookup[listName] = list;
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
      logger.info(`result - ${result}`);
    } else {
      const removedValue = list.shift();
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
