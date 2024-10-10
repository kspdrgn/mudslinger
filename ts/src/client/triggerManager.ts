import { GlEvent, GlDef, EventHook } from "./event";

import { UserConfig } from "./userConfig";

import { JsScript } from "./jsScript";
import { TrigAlItem } from "./trigAlEditBase";


export class TriggerManager {
    public evtTriggersChanged = new EventHook<void>();

    private enabled: boolean = true;
    public triggers: Array<TrigAlItem> | undefined = undefined;

    constructor(private jsScript: JsScript) {
        /* backward compatibility */
        let savedTriggers = localStorage.getItem("triggers");
        if (savedTriggers) {
            UserConfig.set("triggers", JSON.parse(savedTriggers));
            localStorage.removeItem("triggers");
        }

        this.loadTriggers();

        GlEvent.setTriggersEnabled.handle(this.handleSetTriggersEnabled, this);
        UserConfig.evtConfigImport.handle(this.handleConfigImport, this);
    }

    public saveTriggers() {
        UserConfig.set("triggers", this.triggers);
    }

    private loadTriggers() {
        this.triggers = UserConfig.get("triggers") || [];
    }

    private handleConfigImport(imp: {[k: string]: any}) {
        this.triggers = this.triggers?.concat(imp["triggers"] || []);
        this.saveTriggers();
        this.evtTriggersChanged.fire();
    }

    private handleSetTriggersEnabled(data: GlDef.SetTriggersEnabledData) {
        this.enabled = data;
    }

    public handleLine(line: string) {
        if (!this.enabled || !this.triggers)
            return;
//        console.log("TRIGGER: " + line);
        for (let i = 0; i < this.triggers.length; i++) {
            const trig = this.triggers[i];
            if (trig.regex) {
                const match = line.match(trig.pattern);
                if (!match) {
                    continue;
                }

                if (trig.is_script) {
                    const script = this.jsScript.makeScript(trig.value);
                    if (script) { script(); };
                } else {
                    let value = trig.value;

                    value = value.replace(/\$(\d+)/g, function(m, d) {
                        return match[parseInt(d)] || "";
                    });

                    const cmds = value.replace("\r", "").split("\n");
                    GlEvent.triggerSendCommands.fire(cmds);
                }
            } else {
                if (line.includes(trig.pattern)) {
                    if (trig.is_script) {
                        const script = this.jsScript.makeScript(trig.value);
                        if (script) { script(); };
                    } else {
                        const cmds = trig.value.replace("\r", "").split("\n");
                        GlEvent.triggerSendCommands.fire(cmds);
                    }
                }
            }
        }
    }
}

