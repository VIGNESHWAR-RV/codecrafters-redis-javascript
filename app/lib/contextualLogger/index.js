const { AsyncLocalStorage } = require("node:async_hooks");
const { format } = require("node:util");

class ContextualLogger {
  constructor() {
    this.als = new AsyncLocalStorage();
    this.buffer = [];
    this.isFlushing = false;
    this.BATCH_SIZE = 20; // Only stringify 20 logs before yielding to the event loop
  }

  log(level, message, ...args) {
    const store = this.als.getStore();

    const contextSnapshot = store ? { ...store } : {};

    this.buffer.push({
      level,
      time: new Date().toISOString(),
      context: contextSnapshot,
      msg: format(message, ...args),
    });

    if (!this.isFlushing) {
      this.isFlushing = true;
      setImmediate(() => this.flush());
    }
  }

  flush() {
    if (this.buffer.length === 0) {
      this.isFlushing = false;
      return;
    }

    // Processing only a small chunk of logs to prevent CPU blocking
    const chunk = this.buffer.splice(0, this.BATCH_SIZE);

    let output = "";
    for (let i = 0; i < chunk.length; i++) {
      output += JSON.stringify(chunk[i]) + "\n";
    }

    process.stdout.write(output, () => {
      if (this.buffer.length > 0) {
        setImmediate(() => this.flush());
      } else {
        this.isFlushing = false;
      }
    });
  }
}

const loggerInstance = new ContextualLogger();

const logger = {
  initSubContext: (data = {}, callback) => {
    const parentStore = loggerInstance.als.getStore();
    const newStore = parentStore ? { ...parentStore, ...data } : { ...data };
    return loggerInstance.als.run(newStore, callback);
  },
  setContextKey: (key, value) => {
    const store = loggerInstance.als.getStore();
    if (store) store[key] = value;
  },
  info: (msg, ...args) => loggerInstance.log("INFO", msg, ...args),
  debug: (msg, ...args) => loggerInstance.log("DEBUG", msg, ...args),
  warn: (msg, ...args) => loggerInstance.log("WARN", msg, ...args),
  error: (msg, ...args) => loggerInstance.log("ERROR", msg, ...args),
};

module.exports = { logger };
