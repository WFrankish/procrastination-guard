class WebStorage implements IStorage {
    // stored data
    inBlockOnlyMode: boolean;
    always: string[];
    block: string[];
    allow: string[];

    // which rules are temporarily disabled;
    alwaysTemp: boolean[];
    blockTemp: boolean[];
    allowTemp: boolean[];

    // list of rules to use;
    alwaysList: any[];
    blockList: any[];
    allowList: any[];

    constructor() {
        this.inBlockOnlyMode = false;
        this.always = [];
        this.block = [];
        this.allow = [];
        this.alwaysTemp = [];
        this.blockTemp = [];
        this.allowTemp = [];
        this.alwaysList = [];
        this.blockList = [];
        this.allowList = [];
    }

    // load storage (also used as event for storage, so ignore first two arguments)
    load(): Promise<void> {
        return browser.storage.local
            .get<LocalStorage>({
                inBlockOnlyMode: false,
                always: [],
                block: [],
                allow: []
            })
            .then(storage => {
                this.inBlockOnlyMode = storage.inBlockOnlyMode,
                    this.always = storage.always,
                    this.block = storage.block,
                    this.allow = storage.allow
            });
    }

    save(): Promise<void> {
        return browser.storage.local.set({
            inBlockOnlyMode: this.inBlockOnlyMode,
            always: this.always,
            block: this.block,
            allow: this.allow,
        });
    }
}