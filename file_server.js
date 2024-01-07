const net = require("net");
const fs = require("fs");

function initFileServer(){
    const server = net.createServer(handleFileClient);
    server.listen(49154);
}

/**
 * 
 * @param { net.Socket } socket 
 */
function handleFileClient(socket){
    socket.on('data', async data => {
        let [command, path] = data.toString().split("\r");
        
        if(command == "metadata"){
            let fileStats = fs.statSync(path);
            socket.write(fileStats.size.toString());
            console.log(fileStats.size.toString());
        }
        else{
            const readStream = fs.createReadStream(path, {highWaterMark: 65536});

            readStream.on('data', chunk => {
                socket.write(chunk);
            });

            readStream.on('end', chunk => {
                socket.end();
            });
        }
    });
}

module.exports = {
    initFileServer
}