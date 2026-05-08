const { AsyncLocalStorage } = require("node:async_hooks");
const { format } = require("node:util");

// ANSI Escape Codes for Colors
const COLORS = {
  INFO: "\x1b[32m", // Green
  DEBUG: "\x1b[34m", // Blue
  WARN: "\x1b[33m", // Yellow
  ERROR: "\x1b[31m", // Red
  RESET: "\x1b[0m",
};

class ContextualLogger {
  constructor() {
    this.als = new AsyncLocalStorage();
    this.buffer = [];
    this.isFlushing = false;
    this.BATCH_SIZE = 20;
  }

  log(level, ...messages) {
    const store = this.als.getStore();
    const contextSnapshot = store ? { ...store } : {};

    this.buffer.push({
      level,
      time: new Date().toISOString(),
      context: contextSnapshot,
      args: messages,
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

    const chunks = this.buffer.splice(0, this.BATCH_SIZE);
    let output = "";

    for (let i = 0; i < chunks.length; i++) {
      const item = chunks[i];
      const colorCode = COLORS[item.level] || COLORS.RESET;
      const coloredLevel = `${colorCode}${item.level}${COLORS.RESET}`;
      const renderedMsg = `${colorCode}${format(...item.args)}${COLORS.RESET}`;

      const logEntry = `[${item.time}] ${coloredLevel} context:${JSON.stringify(item.context)} ${renderedMsg}`;

      // Stringify and then UN-ESCAPE the ANSI codes so the terminal sees them
      // JSON.stringify turns \x1b into \\u001b. We turn it back.
      output += logEntry.replace(/\\u001b/g, "\x1b") + "\n";
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
