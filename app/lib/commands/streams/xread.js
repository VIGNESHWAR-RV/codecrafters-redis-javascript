const { logger } = require("../../contextualLogger");
const { redisLookup } = require("../../inMemoryLookup");
const {
  encodeToRespBulkString,
  encodeToRespArray,
  encodeToRespNullArray,
} = require("../../respParser");

const streamObserversLookup = new Map();

function notifyXReadObservers(stream_key) {
  setImmediate(() => {
    const observersList = streamObserversLookup.get(stream_key);
    if (observersList) {
      observersList.forEach((cb) => cb(stream_key));
    }
  });
}

function getStreamKeysAndIdsFromArgs(args) {
  const streamKeysAndIds = [];

  const argsLength = args.length / 2;
  for (let i = 0; i < argsLength; i++) {
    streamKeysAndIds.push({
      stream_key: args[i],
      id: args[i + argsLength].split("-").map((el, index) => {
        if (el === "$") {
          const { entries } = redisLookup?.[args[i]] ?? {
            entries: [{ id: [0, 0] }],
          };
          console.log(entries[entries.length - 1].id);
          return entries[entries.length - 1].id;
        } else {
          return +el;
        }
      }),
    });
  }

  return streamKeysAndIds;
}

function readStreamKeysAndIds(streamKeysAndIds) {
  const res = [];
  let isAllStreamRecordsPresent = true;

  for (let j = 0; j < streamKeysAndIds.length; j++) {
    const { stream_key, id } = streamKeysAndIds[j];

    const { entries } = redisLookup?.[stream_key] ?? {};
    const [queryMilliSecondId, querySequenceId] = id;

    const resRecords = [];
    for (let k = 0; k < entries.length; k++) {
      const { id, args } = entries[k];
      if (id[0] >= queryMilliSecondId && id[1] > querySequenceId) {
        const encodedRecordId = encodeToRespBulkString(id.join("-"));
        const encodedArgs = args.map(encodeToRespBulkString);
        resRecords.push([encodedRecordId, encodedArgs]);
      }
    }

    if (!resRecords.length) {
      isAllStreamRecordsPresent = false;
      streamKeysAndIds[j].isRecordsPresent = true;
    }

    res.push([encodeToRespBulkString(stream_key), resRecords]);
  }

  return [res, isAllStreamRecordsPresent];
}

async function xReadCommand(type, ...args) {
  try {
    switch (type.toUpperCase()) {
      case "BLOCK": {
        const [blockMilliSecond, streamType, ...actualArgs] = args;
        const streamKeysAndIds = getStreamKeysAndIdsFromArgs(actualArgs);
        let [result, isAllStreamRecordsPresent] =
          readStreamKeysAndIds(streamKeysAndIds);

        if (!isAllStreamRecordsPresent) {
          [result, isAllStreamRecordsPresent] = await new Promise(
            (resolve, reject) => {
              let timerId;

              const callback = (updatedStreamKey) => {
                const observedStreamkey = streamKeysAndIds.find(
                  ({ stream_key }) => stream_key === updatedStreamKey,
                );

                if (!observedStreamkey) {
                  const observersList =
                    streamObserversLookup.get(updatedStreamKey);
                  if (observersList) {
                    const index = observersList.indexOf(callback);
                    if (index > -1) observersList.splice(index, 1);
                    if (!observersList.length) {
                      streamObserversLookup.delete(stream_key);
                    }
                  }
                }

                const { entries } = redisLookup[observedStreamkey.stream_key];
                const isRecordsPresent = entries.find(({ id }) => {
                  const [milliSecondId, sequenceId] = id;
                  const [observedMilliSecondId, observedSequenceId] =
                    observedStreamkey.id;
                  return (
                    observedMilliSecondId >= milliSecondId &&
                    observedSequenceId > sequenceId
                  );
                });

                if (isRecordsPresent) {
                  observedStreamkey.isRecordsPresent = true;
                  const observersList = streamObserversLookup.get(
                    observedStreamkey.stream_key,
                  );
                  if (observersList) {
                    const index = observersList.indexOf(callback);
                    if (index > -1) observersList.splice(index, 1);
                    if (!observersList.length) {
                      streamObserversLookup.delete(stream_key);
                    }
                  }
                }

                const isStreamKeysYetToBeObserved = streamKeysAndIds.find(
                  ({ isRecordsPresent }) => !isRecordsPresent,
                );

                if (!isStreamKeysYetToBeObserved) {
                  const response = readStreamKeysAndIds(streamKeysAndIds);
                  resolve(response);
                }
              };

              streamKeysAndIds.forEach(({ stream_key }) => {
                let observersList = streamObserversLookup.get(stream_key);
                if (!observersList) {
                  observersList = [];
                  streamObserversLookup.set(stream_key, observersList);
                }
                observersList.push(callback);
              });

              if (+blockMilliSecond) {
                logger.debug(`setting timer - ${blockMilliSecond}`);
                timerId = setTimeout(() => {
                  streamKeysAndIds.forEach(({ stream_key }) => {
                    const observersList = streamObserversLookup.get(stream_key);
                    if (observersList) {
                      const index = observersList.indexOf(callback);
                      if (index > -1) observersList.splice(index, 1);
                      if (!observersList.length) {
                        streamObserversLookup.delete(stream_key);
                      }
                    }
                  });
                  reject(
                    new Error(
                      `client given wait time is over - ${blockMilliSecond} milli seconds`,
                    ),
                  );
                }, +blockMilliSecond);
              }
            },
          );
        }

        if (isAllStreamRecordsPresent) {
          return encodeToRespArray(result);
        } else {
          return encodeToRespNullArray();
        }
      }
      default: {
        const streamKeysAndIds = getStreamKeysAndIdsFromArgs(args);

        const [result, isAllStreamRecordsPresent] =
          readStreamKeysAndIds(streamKeysAndIds);

        if (isAllStreamRecordsPresent) {
          return encodeToRespArray(result);
        } else {
          return encodeToRespNullArray();
        }
      }
    }
  } catch (err) {
    logger.error(err.stack);
    const res = encodeToRespNullArray();
    return res;
  }
}

module.exports = {
  notifyXReadObservers,
  xReadCommand,
};
