interface IStorage {
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

    save(): Promise<void>;
    load(): Promise<void>;
}

type LocalStorage = {
    inBlockOnlyMode: boolean;
    always: string[];
    block: string[];
    allow: string[];
}