const crypto = require("node:crypto");

function generateContextID() {
  return crypto.randomUUID().split("-").join("");
}

function generateReplicationId() {
  return crypto.randomBytes(20).toString("hex");
}

module.exports = {
  generateContextID,
  generateReplicationId,
};
