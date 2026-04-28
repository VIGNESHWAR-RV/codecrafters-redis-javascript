const { logger } = require("../contextualLogger");
const { redisLookup } = require("../inMemoryLookup/index");
const {
  encodeToRespBulkString,
  encodeToRespArray,
} = require("../respParser/index");

const observersLookup = new Map();

function createObservableArray() {
  let timeout;
  let isManualMutation = false;

  const observed = new Proxy([], {
    set(target, prop, value) {
      target[prop] = value;
      if (!isManualMutation && observersLookup.get(observed)) {
        // Clear and reset a timer so the logic runs only ONCE after the last set
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          isManualMutation = true;
          const removedValue = observed.shift();
          const callbacks = observersLookup.get(observed);
          logger.info(`calling mutation observers - ${callbacks.length}`);
          callbacks.forEach((cb) => cb(removedValue));
          observersLookup.delete(observed);
          isManualMutation = false;
        }, 1000);
      }

      return true;
    },
  });

  return observed;
}

async function blPopCommand(listName, timer = 0) {
  timer = +timer;
  let list = redisLookup[listName];

  if (!list) {
    list = createObservableArray();
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
      const callback = (removedValue) => {
        logger.info("triggering callback");
        res([listName, removedValue]);
      };
      observersList.push(callback);
      if (timer) {
        logger.info(`setting timer - ${timer}`);
        setTimeout(() => {
          observersLookup.set(
            list,
            observersList.filter((cb) => cb !== callback),
          );
          res([]);
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
}

module.exports = {
  blPopCommand,
};
