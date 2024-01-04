const net = require("net");
const fs = require("fs");

function formatFileSize(sizeBytes){
    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;
    const TB = GB * 1024;

    if(sizeBytes > TB){
        return `${(sizeBytes/TB).toFixed(2)} TB`;
    } else if(sizeBytes > GB) {
        return `${(sizeBytes/GB).toFixed(2)} GB`;
    } else if(sizeBytes > MB){
        return `${(sizeBytes/MB).toFixed(2)} MB`;
    } else if(sizeBytes > KB){
        return `${(sizeBytes/KB).toFixed(2)} KB`;
    } else {
        return `${(sizeBytes/KB).toFixed(2)} Bytes`;
    }
}

function initDirectoryServer(){
    let server = net.createServer(
        socket => {
            handleDirectoryClient(socket);
        }
    );

    server.listen(49153, "0.0.0.0", () => {console.log("Directory server up")});
}

/**
 * 
 * @param {net.socket} socket 
 */
function handleDirectoryClient(socket){
    let path = "D:";
    socket.on('data', data => {
        let dataStr = data.toString().trimEnd();
        let [command, arg] = dataStr.split("\r");

        // Possible commands: ls, cd, backn
        if(command == "ls"){
            // Do nothing, just send directory listing at the end
        }
        else if(command == "cd"){
            // An arg (folder name) is required for cd
            if(arg == undefined || arg == null){
                socket.write("417\r\n");
                return;
            }

            // If directory does not exist, 404 needs to be sent
            if(!fs.existsSync(`${path}/${arg}`)){
                socket.write("404\r\n");
                return;
            }

            // Add directory to path
            path += `/${arg}`;
        }
        else if(command == "backn"){
            // An arg (n) is required for backn
            if(!arg){
                socket.write("417\r\n");
                return;
            }

            let n = parseInt(arg);

            // remove last n directories from path
            let pathParts = path.split("/");
            pathParts.slice(0, pathParts.length - n);
            path = pathParts.join("/");
        }
        // Command processed

        // return the list of items of current directory
        socket.write(getDirectoryItems(path));
    });
}

function getDirectoryItems(pathToRead){
    console.log(`reading ${pathToRead}`);
    let isRootDir = pathToRead == "D:";

    let resposeBuffer = `200\r${isRootDir}\r${pathToRead}\r`;

    // Getting all items in directory

    // For some reason, passing just D: returns items of current directory
    // so, if path is only D:, adding a slash
    let items = fs.readdirSync(pathToRead + (isRootDir ? "/" : ""));
    console.log(items);

    let files = [];
    let folders = [];

    // Looping over each item and preparing response,
    // while sorting items into files and folders
    items.forEach(item => {
        let stat;
        let subtitle;

        try{
            stat = fs.statSync(`${pathToRead}/${item}`);
        }
        catch(_){
            files.push(`${item}\rPermission required\rDawn of time`);
            return;
        }

        if(stat.isFile()) {
            subtitle = `${formatFileSize(stat.size)}`;
            files.push(`${item}\r${subtitle}\rA long time ago`);
        }
        else {
            let subDirCount;
            try{
                subDirCount = fs.readdirSync(`${pathToRead}/${item}`).length;
                subtitle = `${subDirCount} items`;
            }catch(_){
                subtitle = `Permission required`;
            }
            folders.push(`${item}\r${subtitle}\rA long time ago`);
        }
    });

    // Adding folders and files to the response
    resposeBuffer += `${folders.join("\n")}\t${files.join("\n")}\r\n\r\n`;
    return resposeBuffer;
}

module.exports = {
    initDirectoryServer
}