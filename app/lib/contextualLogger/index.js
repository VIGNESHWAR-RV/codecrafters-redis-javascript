const { AsyncLocalStorage } = require("node:async_hooks");
const { formatWithOptions } = require("node:util");

const isTTY = true; // process.stdout.isTTY;

const COLORS = {
  INFO: "\x1b[32m",
  DEBUG: "\x1b[36m",
  WARN: "\x1b[33m",
  ERROR: "\x1b[31m",
  RESET: "\x1b[0m",
};

class ContextualLogger {
  constructor() {
    this.als = new AsyncLocalStorage();
    this.buffer = [];
    this.isFlushing = false;
    this.BATCH_SIZE = 100;
  }

  log(level, ...messages) {
    const context = this.als.getStore() || null;

    this.buffer.push({
      level,
      time: new Date().toISOString(),
      context,
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

    // High performance: Take a slice and reset the main buffer immediately
    // This stops the O(N) array modification tax
    const chunks = this.buffer;
    this.buffer = [];

    let output = "";
    const total = chunks.length;

    for (let i = 0; i < chunks.length; i++) {
      const item = chunks[i];

      // Clean serialization wrapper handling Errors natively
      const formattedMsg = formatWithOptions({ colors: isTTY }, ...item.args);

      if (isTTY) {
        // Human-readable terminal output format
        const color = COLORS[item.level] || "";
        const ctxStr = item.context
          ? ` ctx:${JSON.stringify(item.context)}`
          : "";
        output += `[${item.time}] ${color}${item.level}${COLORS.RESET} ${ctxStr} ${formattedMsg}\n`;
      } else {
        // Pure JSON machine-readable output for production
        output +=
          JSON.stringify({
            time: item.time,
            level: item.level,
            context: item.context,
            message: formattedMsg,
          }) + "\n";
      }
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
