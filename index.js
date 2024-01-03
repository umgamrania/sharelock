const { Device } = require("./device");
const { flood } = require("./network");
const discovery = require("./discovery");

discovery.initPingServerSocket(device => {
    console.log(Device.getAvailableDevices());
});

flood((device) => {
    console.log(Device.getAvailableDevices());
})