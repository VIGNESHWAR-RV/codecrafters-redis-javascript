const { clientLookup } = require("../../inMemoryLookup");
const { encodeToRespString } = require("../../respParser");

function replConfCommand(clientId, cmd, value) {
  const clientDetials = clientLookup[clientId];
  switch (cmd) {
    case "listening-port": {
      clientDetials.isReplica = true;
      clientDetials.port = +value;
      break;
    }
    case "capa": {
      clientDetials.capability = value;
      break;
    }
  }

  return encodeToRespString("OK");
}

module.exports = {
  replConfCommand,
};
