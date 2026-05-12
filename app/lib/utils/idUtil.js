const crypto = require("node:crypto");

function generateReplicationId() {
  return crypto.randomBytes(20).toString("hex");
}

module.exports = {
  generateReplicationId,
};
