const net = require("net");
const RespParser = require('respjs');

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const redisLookup = {};

// Uncomment the code below to pass the first stage
const server = net.createServer((connection) => {
  // Handle connection
  connection.on('data', (data)=> {
    // console.log(`Data received - ${data}`);
    const req = RespParser.decode(data);
    switch (req[0]) {
      case 'PING': {
        const res = RespParser.encodeString('PONG').toString();
        connection.write(res); 
        break;
      }
      case 'ECHO': {
        const [type , detailsToTalkBack] = req;
        const res = RespParser.encodeBulk(detailsToTalkBack).toString();
        connection.write(res);
        break;
      }
      case 'SET': {
        const [type, key, value] = req;
        redisLookup[key] = value;
        const res = RespParser.encodeString('OK').toString();
        connection.write(res);
        break;
      }
      case 'GET': {
        const [type, key] = req;
        const value = redisLookup[key];
        const res = RespParser.encodeBulk(value).toString();
        connection.write(res);
        break;
      }
    }
  });
});


server.listen(6379, "127.0.0.1");
