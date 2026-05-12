const { generateReplicationId } = require("../utils/idUtil");

const redisLookup = {};
const clientLookup = { clientCounter: 0 };
const serverDetails = {
  port: 6379,
  host: "127.0.0.1",
  replicationId: generateReplicationId(),
  offset: 0,
};

module.exports = {
  redisLookup,
  clientLookup,
  serverDetails,
};
