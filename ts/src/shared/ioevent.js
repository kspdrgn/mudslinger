class IoEventHook {
    constructor(ioObj, evtName) {
        this.ioObj = ioObj;
        this.evtName = evtName;
    }
    handle(callback) {
        return this.ioObj.on(this.evtName, callback);
    }
    fire(data) {
        return this.ioObj.emit(this.evtName, data);
    }
}
export class IoEvent {
    constructor(ioOobj) {
        this.ioOobj = undefined;
        this.srvTelnetData = new IoEventHook(this.ioOobj, "srvTelnetData");
        this.srvTelnetClosed = new IoEventHook(this.ioOobj, "srvTelnetClosed");
        this.srvTelnetOpened = new IoEventHook(this.ioOobj, "srvTelnetOpened");
        this.srvTelnetError = new IoEventHook(this.ioOobj, "srvTelnetError");
        this.srvSetClientIp = new IoEventHook(this.ioOobj, "srvSetClientIp");
        this.clReqTelnetOpen = new IoEventHook(this.ioOobj, "clReqTelnetOpen");
        this.clReqTelnetClose = new IoEventHook(this.ioOobj, "clReqTelnetClose");
        this.clReqTelnetWrite = new IoEventHook(this.ioOobj, "clReqTelnetWrite");
        this.ioOobj = ioOobj;
    }
}
export default IoEvent;
