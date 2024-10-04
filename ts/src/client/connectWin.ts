import { Socket } from "./socket";

export class ConnectWin {
    private socket: Socket;

    private $win: JQuery;
    private $connectButton: JQuery;
    private $hostInput: JQuery;
    private $portInput: JQuery;

    constructor(socket: Socket) {
        this.socket = socket;

        let win = document.createElement("div");
        win.style.display = "none";
        win.className = "winConnect";
        document.body.appendChild(win);

        win.innerHTML = `
        <!--header-->
        <div>CONNECTION</div>
        <!--content-->
        <div>
            Host: 
            <input class="winConnect-inputHost" placeholder="123.123.123.123">
            <br>
            Port:
            <input class="winConnect-inputPort" placeholder="7000">
            <br>
            <button class="winConnect-btnConnect">CONNECT</button>
        </div>
        `;

        this.$win = $(win);
        this.$connectButton = $(win.getElementsByClassName("winConnect-btnConnect")[0]) as JQuery<HTMLButtonElement>;
        this.$hostInput = $(win.getElementsByClassName("winConnect-inputHost")[0]) as JQuery<HTMLInputElement>;
        this.$portInput = $(win.getElementsByClassName("winConnect-inputPort")[0]) as JQuery<HTMLInputElement>;

        (<any>this.$win).jqxWindow({ isModal: true });

        this.$win.on('close', function () {
            (<any>$('.jqx-window-modal')).addClass("force-hidden");
        });

        this.$win.on('open', function () {
            (<any>$('.jqx-window-modal')).removeClass("force-hidden");
        });



        this.$connectButton.click(this.handleConnectButtonClick.bind(this));
    }

    private handleConnectButtonClick() {
        let host: string = (this.$hostInput.val() as string).trim();
        let port: number = +((this.$portInput.val() as string).trim());

        this.socket.openTelnet(host, port);

        this.hide();
    }

    public show() {
        (<any>this.$win).jqxWindow("open");
    }

    private hide() {
        (<any>this.$win).jqxWindow("close");
    }
}
