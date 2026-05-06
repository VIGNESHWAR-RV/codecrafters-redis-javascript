const { encodeToRespBulkString } = require("../../respParser");

function echoCommand(clientId, detailsToTalkBack) {
  const res = encodeToRespBulkString(detailsToTalkBack);
  return res;
}

module.exports = {
  echoCommand,
};
