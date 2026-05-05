const { encodeToRespString } = require("../../respParser");

function multiCommand() {
  return encodeToRespString("OK");
}

module.exports = {
  multiCommand,
};
