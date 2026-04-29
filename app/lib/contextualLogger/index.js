const { AsyncLocalStorage } = require("node:async_hooks");
const { format } = require("node:util");

class ContextualLogger {
  constructor() {
    this.als = new AsyncLocalStorage();
    this.buffer = [];
    this.isFlushing = false;
    this.BATCH_SIZE = 20; // Only stringify 20 logs before yielding to the event loop
  }

  log(level, ...messages) {
    const store = this.als.getStore();

    const contextSnapshot = store ? { ...store } : {};

    this.buffer.push({
      level,
      time: new Date().toISOString(),
      context: contextSnapshot,
      msg: messages,
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
    const chunks = this.buffer.splice(0, this.BATCH_SIZE);

    let output = "";
    for (let i = 0; i < chunks.length; i++) {
      chunks[i].msg = format(chunks[i].msg);
      output += JSON.stringify(chunks[i]) + "\n";
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
  info: (...msg) => loggerInstance.log("INFO", ...msg),
  debug: (...msg) => loggerInstance.log("DEBUG", ...msg),
  warn: (...msg) => loggerInstance.log("WARN", ...msg),
  error: (...msg) => loggerInstance.log("ERROR", ...msg),
};

module.exports = { logger };
