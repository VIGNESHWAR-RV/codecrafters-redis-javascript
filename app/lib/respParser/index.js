const RespParser = require("respjs");

function decodeResp(data) {
  const parsedData = RespParser.decode(data);
  return parsedData;
}

function encodeToRespInteger(val) {
  const res = RespParser.encodeInteger(val);
  return res;
}

function encodeToRespString(data) {
  const res = RespParser.encodeString(data);
  return res;
}

function encodeToRespNull() {
  const res = RespParser.encodeNull();
  return res;
}

function encodeToRespBulkString(data) {
  const res = RespParser.encodeBulk(data);
  return res;
}

function encodeToRespArray(arr = []) {
  const res = RespParser.encodeArray(arr);
  return res;
}

function encodeToRespNullArray() {
  const res = RespParser.encodeNullArray();
  return res;
}

function encodeToRespError(err) {
  let error = err ? err : new Error("unknown error");
  error.name = "ERR";
  const res = RespParser.encodeError(error);
  return res;
}

module.exports = {
  decodeResp,
  encodeToRespInteger,
  encodeToRespString,
  encodeToRespNull,
  encodeToRespBulkString,
  encodeToRespArray,
  encodeToRespNullArray,
  encodeToRespError,
};
