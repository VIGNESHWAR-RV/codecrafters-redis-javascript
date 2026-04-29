const { encodeToRespString } = require("../../respParser");

function pingCommand() {
  const res = encodeToRespString("PONG");
  return res;
}

module.exports = {
  pingCommand,
};
