"use strict";
class WebStorage {
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
    load() {
        return browser.storage.local
            .get({
            inBlockOnlyMode: false,
            always: [],
            block: [],
            allow: []
        })
            .then(storage => {
            this.inBlockOnlyMode = storage.inBlockOnlyMode,
                this.always = storage.always,
                this.block = storage.block,
                this.allow = storage.allow;
        });
    }
    save() {
        return browser.storage.local.set({
            inBlockOnlyMode: this.inBlockOnlyMode,
            always: this.always,
            block: this.block,
            allow: this.allow,
        });
    }
}
