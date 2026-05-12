const redisLookup = {};
const clientLookup = { clientCounter: 0 };
const serverDetails = { port: 6379, ip: "127.0.0.1" };

module.exports = {
  redisLookup,
  clientLookup,
  serverDetails,
};
