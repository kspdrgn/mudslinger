class IoEventHook<TData> {
    constructor(private readonly ioObj: any, private readonly evtName: string) {
    }
    
    public handle(callback: (data: TData) => void) {
        return this.ioObj?.on(this.evtName, callback);
    }

    public fire(data: TData): boolean {
        return this.ioObj?.emit(this.evtName, data);
    }
}

export class IoEvent {
    constructor(ioOobj: any) {
        this.ioOobj = ioOobj;
    }
    ioOobj: any = undefined;

    public srvTelnetData = new IoEventHook<ArrayBuffer>(this.ioOobj, "srvTelnetData");
    public srvTelnetClosed = new IoEventHook<boolean>(this.ioOobj, "srvTelnetClosed");
    public srvTelnetOpened = new IoEventHook<void>(this.ioOobj, "srvTelnetOpened");
    public srvTelnetError = new IoEventHook<string>(this.ioOobj, "srvTelnetError");
    public srvSetClientIp = new IoEventHook<string>(this.ioOobj, "srvSetClientIp");

    public clReqTelnetOpen = new IoEventHook<[string, number]>(this.ioOobj, "clReqTelnetOpen");
    public clReqTelnetClose = new IoEventHook<void>(this.ioOobj, "clReqTelnetClose");
    public clReqTelnetWrite = new IoEventHook<ArrayBuffer>(this.ioOobj, "clReqTelnetWrite");
}

export default IoEvent;