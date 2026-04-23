const RespParser = require('respjs');


function decodeResp(data) {
  const parsedData = RespParser.decode(data);
  return parsedData;
}

function encodeToRespString(data) {
  const res = RespParser.encodeString(data).toString();
  return res;
}

function encodeToRespNull(){
  const res = RespParser.encodeNull().toString();
  return res;
}

function encodeToRespBulkString(data) {
  const res = RespParser.encodeBulk(data).toString();
  return res;
}

module.exports = {
    decodeResp,
    encodeToRespString,
    encodeToRespNull,
    encodeToRespBulkString
}