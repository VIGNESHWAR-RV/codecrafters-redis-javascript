const RespParser = require("respjs");

function decodeResp(data) {
  const parsedData = RespParser.decode(data);
  return parsedData;
}

function encodeToRespInteger(val) {
  const res = RespParser.encodeInteger(val).toString();
  return res;
}

function encodeToRespString(data) {
  const res = RespParser.encodeString(data).toString();
  return res;
}

function encodeToRespNull() {
  const res = RespParser.encodeNull().toString();
  return res;
}

function encodeToRespBulkString(data) {
  const res = RespParser.encodeBulk(data).toString();
  return res;
}

function encodeToRespError(err) {
  let error = err ? err : new Error("unknown error");
  const res = RespParser.encodeError(error).toString();
  return res;
}

module.exports = {
  decodeResp,
  encodeToRespInteger,
  encodeToRespString,
  encodeToRespNull,
  encodeToRespBulkString,
  encodeToRespError,
};
