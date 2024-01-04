const { Device } = require("./device");
const { flood } = require("./network");
const discovery = require("./discovery");
const directoryServer = require("./directory_server");

discovery.initPingServerSocket(device => {
    console.log(Device.getAvailableDevices());
});

flood((device) => {
    console.log(Device.getAvailableDevices());
});

directoryServer.initDirectoryServer();