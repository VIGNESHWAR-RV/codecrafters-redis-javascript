const { AsyncLocalStorage } = require("node:async_hooks");
const { format } = require("node:util");

class ContextualLogger {
  constructor() {
    this.als = new AsyncLocalStorage();
    this.buffer = [];
    this.isFlushing = false;
  }

  log(level, message, ...args) {
    const context = this.als.getStore() || {};

    const logEntry = {
      level,
      context,
      msg: format(message, ...args),
    };

    // Buffer the stringified JSON
    this.buffer.push(JSON.stringify(logEntry) + "\n");

    // If we aren't already in a flush cycle, schedule one
    if (!this.isFlushing) {
      this.isFlushing = true;
      setImmediate(() => this.flush());
    }
  }

  /**
   * Batch writes the buffer to stdout to minimize Syscalls.
   */
  flush() {
    if (this.buffer.length === 0) {
      this.isFlushing = false;
      return;
    }

    const output = this.buffer.join("");
    this.buffer = [];

    // Low-level write to the OS pipe (stdout)
    process.stdout.write(output, () => {
      // Recursive check: If new logs arrived during the OS write,
      // flush again. Otherwise, release the lock.
      if (this.buffer.length > 0) {
        this.flush();
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
    if (store) {
      store[key] = value;
    }
  },

  info: (msg, ...args) => {
    loggerInstance.log("INFO", msg, ...args);
  },

  debug: (msg, ...args) => {
    loggerInstance.log("DEBUG", msg, ...args);
  },

  warn: (msg, ...args) => {
    loggerInstance.log("WARN", msg, ...args);
  },

  error: (msg, ...args) => {
    loggerInstance.log("ERROR", msg, ...args);
  },
};

module.exports = {
  logger,
};
