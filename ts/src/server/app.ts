import fs from "fs";
import express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import * as net from "net";

import IoEvent from "../shared/ioevent.js";

interface ServerConfigType {
    useHttpServer: boolean | undefined
    serverPort: number | undefined
    targetHost: string | undefined
    targetPort: number | undefined
}

const serverConfig: ServerConfigType = {    
    /* If false, only serve socket.io and not http */
    useHttpServer: true,

    /* http server port if useHttpServer is true, else the socket.io port */
    serverPort: 8008,

    /* targetHost and targetPort set as null means client can connect to any host/port.
    Set these values to hardcode the connection to a specific host and port 

    If hardcoding a target, be sure to also set hardcodedTarget to true in configClient.js
    */
    targetHost: undefined,
    targetPort: undefined,
};

console.log(serverConfig);

let cwd = process.cwd();

let app: express.Express;
let server: http.Server;
let io: socketio.Server;

if (serverConfig.useHttpServer === true) {
    app = express();
    server = http.createServer(app);
    io = new socketio.Server(server);
} else {
    io = new socketio.Server(serverConfig.serverPort);
}

let telnetNs: socketio.Namespace = io.of("/telnet");
telnetNs.on("connection", (client: socketio.Socket) => {
    let telnet: net.Socket | null = null;
    let ioEvt = new IoEvent(client);

    let writeQueue: any[] = [];
    let canWrite: boolean =  true;
    let checkWrite = () => {
        if (!canWrite) { return; }

        if (writeQueue.length > 0) {
            let data = writeQueue.shift();
            canWrite = false;
            canWrite = telnet?.write(data as Buffer) ?? false;
        }
    };

    let writeData = (data: any) => {
        writeQueue.push(data);
        checkWrite();
    };

    client.on("disconnect", () => {
        if (telnet) {
            telnet.end();
            telnet = null;
        }
    });

    ioEvt.clReqTelnetOpen.handle((args: [string, number]) => {
        telnet = new net.Socket();

        let host: string;
        let port: number;

        if (serverConfig.targetHost != null) {
            host = serverConfig.targetHost;
            port = serverConfig.targetPort ?? 0;
        } else {
            host = args[0];
            port = args[1];
        }

        telnet.on("data", (data: Buffer) => {
            ioEvt.srvTelnetData.fire(data.buffer);
        });
        telnet.on("close", (had_error: boolean) => {
            ioEvt.srvTelnetClosed.fire(had_error);
            telnet = null;
        });
        telnet.on("drain", () => {
            canWrite = true;
            checkWrite();
        });
        telnet.on("error", (err: Error) => {
            console.log("TELNET ERROR: ", err);
            ioEvt.srvTelnetError.fire(err.message);
        });

        try {
            console.log(
                client.request.connection.remoteAddress
                + " connecting to "
                + host + ":" + port);
            telnet.connect(port, host, () => {
                ioEvt.srvTelnetOpened.fire();
            });
        }
        catch (err) {
            console.log("ERROR CONNECTING TELNET: ", err);
            ioEvt.srvTelnetError.fire(err.message);
        }
    });

    ioEvt.clReqTelnetClose.handle(() => {
        if (telnet == null) { return; }
        telnet.end();
        telnet = null;
    });

    ioEvt.clReqTelnetWrite.handle((data) => {
        if (telnet == null) { return; }
        writeData(data);
    });

    ioEvt.srvSetClientIp.fire(client.request.connection.remoteAddress);
});

if (serverConfig.useHttpServer) {
    app.use(express.static("static"));

    app.get("/", function(req, res) {
        res.sendFile("static/index.html", {root: cwd});
    });

    app.use((err: any, req: any, res: any, next: any) => {
        console.log("App error: " +
                    "err: " + err + " | " +
                    "req: " + req + " | " +
                    "res: " + res + " | ");
        next(err);
    });

    server.on("error", (err: Error) => {
        console.log("Server error: ", err);
    });

    server.on("error", (err: Error) => {
        console.log("Server error: ", err);
    });

    server.listen(serverConfig.serverPort, function() {
        console.log("Server is running at port " + serverConfig.serverPort);
    });
}

