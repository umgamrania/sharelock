/**
 * An encapsulation for devices' data
 * 
 * Also maintains a static list of all available devices
 */
class Device{

    // An object with the ip address of the device as the key
    // and entire object (including ip) as the value
    // This is to prevent duplication, there should only be
    // one device with any given IP
    static availableDevices = {};

    /**
     * 
     * @param {String} deviceName Name of the device
     * @param {String} deviceType Type of device
     * @param {String} ip IP address of the device
     */
    constructor(deviceName, deviceType, ip){
        this.deviceName = deviceName;
        this.deviceType = deviceType;
        this.ip = ip;

        Device.availableDevices[ip] = this;
    }

    /**
     * Clears the static list of all available devices
     * Intended to use when the network is flooded.
     */
    static clearDeviceList(){
        Device.availableDevices = {};
    }
    
    /**
     * @returns an array of all devices
     */
    static getAvailableDevices(){
        return Object.values(Device.availableDevices);
    }
}

module.exports = {
    Device
}