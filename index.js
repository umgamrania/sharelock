const { Device } = require("./device");
const discovery = require("./discovery");

discovery.initPingServerSocket(device => {
    console.log(Device.getAvailableDevices());
});