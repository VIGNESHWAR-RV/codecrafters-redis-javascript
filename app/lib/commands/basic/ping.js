const { encodeToRespString } = require("../../respParser");

function pingCommand(clientId) {
  const res = encodeToRespString("PONG");
  return res;
}

module.exports = {
  pingCommand,
};
