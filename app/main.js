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
    switch (req[0].toUpperCase()) {
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
        let [type, key, value, expiryType, expiryValue] = req;
        const val = {value};
        if (expiryType) {
            if (expiryType.toUpperCase() === 'EX') {
                expiryValue = (+expiryValue) * 1000;
            }
            val.expiryTimeStamp = Date.now() + (+expiryValue);
        }
        redisLookup[key] = val;
        const res = RespParser.encodeString('OK').toString();
        connection.write(res);
        break;
      }
      case 'GET': {
        const [type, key] = req;
        let {value, expiryTimeStamp} = redisLookup[key];
        if (expiryTimeStamp && Date.now() >= expiryTimeStamp) {
            delete redisLookup[key];
            const res = RespParser.encodeNull().toString();
            connection.write(res);
            break;
        }
        const res = RespParser.encodeBulk(value).toString();
        connection.write(res);
        break;
      }
    }
  });
});


server.listen(6379, "127.0.0.1");
