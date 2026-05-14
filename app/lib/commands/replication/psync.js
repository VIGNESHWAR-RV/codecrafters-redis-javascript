const { serverDetails, clientLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function pSyncCommand(clientId, replicationIdVal, offsetVal) {
  const { replicationId, offset } = serverDetails;
  const { connection } = clientLookup[clientId];

  connection.write(encodeToRespString(`FULLRESYNC ${replicationId} ${offset}`));
  const emptyRDBBase64 =
    "UkVESVMwMDEx+glyZWRpcy12ZXIFNy4yLjD6CnJlZGlzLWJpdHPAQPoFY3RpbWXCbQi8ZfoIdXNlZC1tZW3CsMQQAPoIYW9mLWJhc2XAAP/wbjv+wP9aog==";
  const emptyRDBBuffer = Buffer.from(emptyRDBBase64, "base64");
  connection.write(`$${emptyRDBBuffer.length}\r\n${emptyRDBBuffer}`);
}

module.exports = {
  pSyncCommand,
};
