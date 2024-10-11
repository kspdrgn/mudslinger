import { GlEvent, GlDef } from "./event";

import { Manager, Socket as SocketIOSocket } from "socket.io-client";
import { Mxp } from "./mxp";
import { OutputManager } from "./outputManager";
import { IoEvent } from "../shared/ioevent";
import { TelnetClient } from "./telnetClient";


declare let configClient: any;


export class Socket {
    private ioConn: SocketIOSocket | undefined;
    private ioEvt: IoEvent;
    private telnetClient: TelnetClient | undefined;
    private clientIp: string;

    constructor(private outputManager: OutputManager, private mxp: Mxp) {
        GlEvent.sendCommand.handle(this.handleSendCommand, this);
        GlEvent.scriptSendCommand.handle(this.handleSendCommand, this);
        GlEvent.sendPw.handle(this.handleSendPw, this);
        GlEvent.triggerSendCommands.handle(this.handleTriggerSendCommands, this);
        GlEvent.aliasSendCommands.handle(this.handleAliasSendCommands, this);
    }

    public open() {
        const host = configClient.socketIoHost || document.domain;
        const port = configClient.socketIoPort || location.port;
        //const url = `http://${host}:${port}/telnet`;
        //const url = `${host}:${port}`;
        const m = new Manager(host, {
            port,
            autoConnect: false,
        });
        const i = m.socket("/telnet");
        this.ioConn = i.connect() as SocketIOSocket | undefined;

        if (!this.ioConn) {
            alert('Could not setup connection');
            return;
        }

        this.ioConn.on("connect", () => {
            GlEvent.wsConnect.fire();
        });

        this.ioConn.on("disconnect", () => {
            GlEvent.wsDisconnect.fire();
        });

        this.ioConn.on("error", (msg: any) => {
            GlEvent.wsError.fire(msg);
        });

        this.ioEvt = new IoEvent(this.ioConn);

        this.ioEvt.srvTelnetOpened.handle(() => {
            this.telnetClient = new TelnetClient((data) => {
                this.ioEvt.clReqTelnetWrite.fire(data);
            });
            this.telnetClient.clientIp = this.clientIp;

            this.telnetClient.EvtData.handle((data) => {
                this.handleTelnetData(data);
            });

            this.telnetClient.EvtServerEcho.handle((data: any) => {
                // Server echo ON means we should have local echo OFF
                GlEvent.setEcho.fire(!data);
            });

            GlEvent.telnetConnect.fire();
        });

        this.ioEvt.srvTelnetClosed.handle(() => {
            this.telnetClient = null;
            GlEvent.telnetDisconnect.fire();
        });

        this.ioEvt.srvTelnetError.handle((data: any) => {
            GlEvent.telnetError.fire(data);
        });

        this.ioEvt.srvTelnetData.handle((data: any) => {
            if (this.telnetClient) {
                this.telnetClient.handleData(data);
            }
        });

        this.ioEvt.srvSetClientIp.handle((ipAddr: string) => {
            let re = /::ffff:(\d+\.\d+\.\d+\.\d+)/;
            let match = re.exec(ipAddr);
            if (match) {
                ipAddr = match[1];
            }

            this.clientIp = ipAddr;
            if (this.telnetClient) {
                this.telnetClient.clientIp = ipAddr;
            }
        });
    }

    public openTelnet(host: string | null, port: number | null) {
        if (host === null || !port)
            return;
        this.ioEvt.clReqTelnetOpen.fire([host, port]);
    }

    public closeTelnet() {
        this.ioEvt.clReqTelnetClose.fire();
    }

    private sendCmd(cmd: string) {
        cmd += "\r\n";
        let arr = new Uint8Array(cmd.length);
        for (let i = 0; i < cmd.length; i++) {
            arr[i] = cmd.charCodeAt(i);
        }
        this.ioEvt.clReqTelnetWrite.fire(arr.buffer);
    }

    private handleSendCommand(data: GlDef.SendCommandData) {
        this.sendCmd(data.value);
    }

    private handleSendPw(data: GlDef.SendPwData) {
        this.sendCmd(data);
    }

    private handleTriggerSendCommands(data: GlDef.TriggerSendCommandsData) {
        for (let i = 0; i < data.length; i++) {
            this.sendCmd(data[i]);
        }
    };

    private handleAliasSendCommands(data: GlDef.AliasSendCommandsData) {
        for (let i = 0; i < data.commands.length; i++) {
            this.sendCmd(data.commands[i]);
        }
    };

    private partialSeq: string | null;
    private handleTelnetData(data: ArrayBuffer) {
        // console.timeEnd("command_resp");
        // console.time("_handle_telnet_data");

        let rx = this.partialSeq || "";
        this.partialSeq = null;
        rx += String.fromCharCode.apply(String, new Uint8Array(data));

        let output = "";
        let rx_len = rx.length;
        let max_i = rx.length - 1;

        for (let i = 0; i < rx_len; ) {
            let char = rx[i];

            /* strip carriage returns while we"re at it */
            if (char === "\r") {
                i++; continue;
            }

            /* Always snip at a newline so other modules can more easily handle logic based on line boundaries */
            if (char === "\n") {
                output += char;
                i++;

                this.outputManager.handleText(output);
                output = "";

                // MXP needs to force close any open tags on newline
                this.mxp.handleNewline();

                continue;
            }

            if (char !== "\x1b") {
                output += char;
                i++;
                continue;
            }

            /* so we have an escape sequence ... */
            /* we only expect these to be color codes or MXP tags */
            let substr = rx.slice(i);
            let re;
            let match;

            /* ansi escapes */
            re = /^\x1b\[(\d+(?:;\d+)?)m/;
            match = re.exec(substr);
            if (match) {
                this.outputManager.handleText(output);
                output = "";

                i += match[0].length;
                let codes = match[1].split(";");
                this.outputManager.handleAnsiGraphicCodes(codes);
                continue;
            }

            /* xterm 256 color */
            re = /^\x1b\[[34]8;5;\d+m/;
            match = re.exec(substr);
            if (match) {
                this.outputManager.handleText(output);
                output = "";

                i += match[0].length;
                this.outputManager.handleXtermEscape(match[0]);
                continue;
            }

            /* MXP escapes */
            re = /^\x1b\[1z(<.*?>)\x1b\[7z/;
            match = re.exec(substr);
            if (match) {
                // MXP tag. no discerning what it is or if it"s opening/closing tag here
                i += match[0].length;
                this.outputManager.handleText(output);
                output = "";
                GlEvent.mxpTag.fire(match[1]);
                continue;
            }

            re = /^\x1b\[7z/;
            match = re.exec(substr);
            if (match) {
                /* this gets sent once at the beginning to set the line mode. We don"t need to do anything with it */
                i += match[0].length;
                continue;
            }

            /* need to account for malformed tags or sequences somehow... for now just treat a newline as a boundary */
            let nl_ind = substr.indexOf("\n");
            if (nl_ind !== -1) {
                let bad_stuff = substr.slice(0, nl_ind + 1);
                i += bad_stuff.length;
                console.log("Malformed sequence or tag");
                console.log(bad_stuff);
                continue;
            }

            /* If we get here, must be a partial sequence
                Send away everything up to the sequence start and assume it will get completed next time
                we receive data...
             */
            if (i !== 0) {
                this.outputManager.handleText(output);
            }
            this.partialSeq = rx.slice(i);
            console.log("Got partial:");
            console.log(this.partialSeq);
            break;
        }
        if (!this.partialSeq) {
            /* if partial we already outputed, if not let"s hit it */
            this.outputManager.handleText(output);
        }
        this.outputManager.outputDone();
        // console.timeEnd("_handle_telnet_data");
    }
}
