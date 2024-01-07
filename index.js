const { Device } = require("./device");
const { flood } = require("./network");
const { initFrontendServer } = require("./frontend-server");
const { initPingServerSocket } = require("./discovery");
const { initDirectoryServer } = require("./directory_server");
const { initFileServer } = require("./file_server");
const ws = require("./websocket");

initPingServerSocket(broadcastDevice);
initDirectoryServer();
initFrontendServer();
initFileServer();

ws.initWebSocket();

function broadcastDevice(device){
    ws.broadcast({
        type: "newDevice",
        device: device
    });
}

flood();