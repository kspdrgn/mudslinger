import { GlEvent, GlDef } from "./event";

import { UserConfig } from "./userConfig";

import { Client } from "./client";
import { Socket } from "./socket";
import { AliasEditor } from "./aliasEditor";
import { TriggerEditor } from "./triggerEditor";
import { JsScriptWin } from "./jsScriptWin";
import { AboutWin } from "./aboutWin";
import { ConnectWin } from "./connectWin";

declare let configClient: any;

export class MenuBar {
    private $menuBar: JQuery;
    private $chkEnableTrig: JQuery;
    private $chkEnableAlias: JQuery;
    private $chkEnableMap: JQuery;
    private $chkEnableGauges: JQuery;

    constructor(
        private client: Client,
        private socket: Socket,
        private aliasEditor: AliasEditor,
        private triggerEditor: TriggerEditor,
        private jsScriptWin: JsScriptWin,
        private aboutWin: AboutWin,
        private connectWin: ConnectWin
        ) {

        this.makeClickFuncs();

        this.$menuBar = $("#menuBar");

        this.$chkEnableTrig = $("#menuBar-chkEnableTrig");
        this.$chkEnableAlias = $("#menuBar-chkEnableAlias");

        (<any>this.$menuBar).jqxMenu({ width: "100%", height: "30px", autoCloseOnClick: true, autoCloseOnMouseLeave: true});
        (<any>this.$menuBar).jqxMenu('minimize');
        this.$menuBar.on("itemclick", (event: any) => { 
            this.handleClick(event);
            if (!$(event.args).hasClass("jqx-menu-minimized-button")) {
                (<any>this.$menuBar).children('.jqx-menu-minimized-button').click(); 
            }
        });

        this.$chkEnableTrig.change(function() {
            const el = this as HTMLInputElement;
            GlEvent.setTriggersEnabled.fire(el.checked);
        });

        this.$chkEnableAlias.change(function() {
            const el = this as HTMLInputElement;
            GlEvent.setAliasesEnabled.fire(el.checked);
        });

        GlEvent.telnetConnect.handle(() => {
            $("#menuBar-conn-disconn").text("Disconnect");
        });

        GlEvent.telnetDisconnect.handle(() => {
            $("#menuBar-conn-disconn").text("Connect");
        });

        GlEvent.wsDisconnect.handle(() => {
            $("#menuBar-conn-disconn").text("Connect");
        });
    }

    private clickFuncs: {[k: string]: () => void} = {};
    private makeClickFuncs() {
        this.clickFuncs["Connect"] = () => {
            if (configClient.hardcodedTarget === true) {
                this.socket.openTelnet(null, null);
            } else {
                $('.jqx-window-modal').removeClass("force-hidden");
                this.connectWin.show();
            }
        };

        this.clickFuncs["Disconnect"] = () => {
            this.socket.closeTelnet();
        };

        this.clickFuncs["Aliases"] = () => {
            $('.jqx-window-modal').removeClass("force-hidden");
            this.aliasEditor.show();
        };

        this.clickFuncs["Triggers"] = () => {
            $('.jqx-window-modal').removeClass("force-hidden");
            this.triggerEditor.show();
        };

        this.clickFuncs["Green on Black"] = () => {
            GlEvent.changeDefaultColor.fire(["green", "low"]);
            GlEvent.changeDefaultBgColor.fire(["black", "low"]);
        };

        this.clickFuncs["White on Black"] = () => {
            GlEvent.changeDefaultColor.fire(["white", "low"]);
            GlEvent.changeDefaultBgColor.fire(["black", "low"]);
        };

        this.clickFuncs["Black on Grey"] = () => {
            GlEvent.changeDefaultColor.fire(["black", "low"]);
            GlEvent.changeDefaultBgColor.fire(["white", "low"]);
        };

        this.clickFuncs["Black on White"] = () => {
            GlEvent.changeDefaultColor.fire(["black", "low"]);
            GlEvent.changeDefaultBgColor.fire(["white", "high"]);
        };

        this.clickFuncs["Script"] = () => {
            $('.jqx-window-modal').removeClass("force-hidden");
            this.jsScriptWin.show();
        };

        this.clickFuncs["Export"] = () => {
            UserConfig.exportToFile();
        };

        this.clickFuncs["Import"] = () => {
            UserConfig.importFromFile();
        };

        this.clickFuncs["About"] = () => {
            $('.jqx-window-modal').removeClass("force-hidden");
            this.aboutWin.show();
        };
    }

    private handleClick(event: any) {
        let item = event.args;
        let text = $(item).text();
    
        if (text in this.clickFuncs) {
            this.clickFuncs[text]();
        }
    }
}
