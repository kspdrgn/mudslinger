import { AppInfo } from "./appInfo";

export class AboutWin {
    private $win: JQuery;

    constructor() {
        let win = document.createElement("div");
        win.style.display = "none";
        win.className = "winAbout";
        document.body.appendChild(win);

        win.innerHTML = `
        <!--header-->
        <div>ABOUT</div>
        <!--content-->
        <div>
            <h1>${AppInfo.AppTitle}</h1>
            <br>
            <a href="${AppInfo.RepoUrl}" target="_blank">${AppInfo.RepoUrl}</a>
            <br>
            Version: ${AppInfo.Version.Major}.${AppInfo.Version.Minor}.${AppInfo.Version.Revision}
        </div>
        `;

        this.$win = $(win);

        (<any>this.$win).jqxWindow({ width: '100%', height: 400, isModal: true });
        this.$win.on('close', function () {
            $('.jqx-window-modal').addClass("force-hidden");
        });
        this.$win.on('open', function () {
            $('.jqx-window-modal').removeClass("force-hidden");
        });
    }

    public show() {
        (<any>this.$win).jqxWindow("open");
    }
}
