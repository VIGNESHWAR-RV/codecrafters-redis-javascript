const net = require("net");
const RespParser = require('respjs');

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

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
    }
  });
});


server.listen(6379, "127.0.0.1");
