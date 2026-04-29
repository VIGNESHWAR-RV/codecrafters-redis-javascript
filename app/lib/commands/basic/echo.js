const { encodeToRespBulkString } = require("../../respParser");

function echoCommand(detailsToTalkBack) {
  const res = encodeToRespBulkString(detailsToTalkBack);
  return res;
}

module.exports = {
  echoCommand,
};
