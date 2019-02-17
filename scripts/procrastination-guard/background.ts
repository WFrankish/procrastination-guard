$(initBackground);

var background: IBackground;

function initBackground() {
    var storage = new WebStorage();
    background = new Background(storage);

    browser.webRequest.onBeforeRequest.addListener(
        background.shouldBlock,
        {
            urls: ["<all_urls>"],
            types: ["main_frame"]
        },
        ["blocking"]
    );

    browser.browserAction.onClicked.addListener(background.startWorkMode);
}

class Background implements IBackground {

    isRunning: boolean;

    readonly storage: IStorage;

    constructor(storage: IStorage) {
        this.isRunning = false;
        this.storage = storage;
    }

    shouldBlock(detail: Detail): browser.webRequest.BlockingResponse {
        var message;
        if (this.isRunning) {
            if (!this.storage.inBlockOnlyMode) {
                message = this.matchAny(this.storage.allowList, detail.url);
                if (message == null) {
                    this.sendNotification(
                        "Procrastination Guard blocked a website!",
                        `${detail.url} does not match any rules on the allow list`
                    );
                }
                return { cancel: message == null };
            } else {
                message = this.matchAny(this.storage.alwaysList, detail.url)
                if (message == null) {
                    message = this.matchAny(this.storage.blockList, detail.url);
                }
            }
        } else {
            message = this.matchAny(this.storage.alwaysList, detail.url);
        }
        if (message != null) {
            this.sendNotification(
                "Procrastination Guard blocked a website!",
                message
            )
        }
        return { cancel: message != null };
    }

    startWorkMode(): void {
        browser.browserAction.onClicked.removeListener(this.startWorkMode);
        browser.browserAction.onClicked.addListener(this.wontStopNotification);
        browser.browserAction.setTitle({
            title: "Procrastination Guard - Work mode enabled"
        });
        browser.browserAction.setIcon({
            path: {
                "16": "button/icon-16.png",
                "32": "button/icon-32.png",
                "64": "button/icon-64.png",
                "256": "button/icon-256.png"
            }
        })
        this.isRunning = true;
    }

    endWorkMode(): void {
        browser.browserAction.onClicked.removeListener(this.wontStopNotification);
        browser.browserAction.onClicked.addListener(this.startWorkMode);
        browser.browserAction.setTitle({
            title: "Procrastination Guard - Enable work mode"
        });
        browser.browserAction.setIcon({
            path: {
                "16": "button/icon_d-16.png",
                "32": "button/icon_d-32.png",
                "64": "button/icon_d-64.png",
                "256": "button/icon_d-256.png"
            }
        })
        this.isRunning = false;
    }

    matchAny(matchList: string[], url: string): string | null {
        var result: string | null = null;
        matchList.forEach((match) => {
            if (url.match(match)) {
                result = `${url} was blocked by rule ${match}`;
                return;
            }
        });
        return result;
    }

    private wontStopNotification(): void {
        this.sendNotification(
            "Are you sure you're done working?",
            "If so, go to the options page to turn off work mode."
        );
    }

    private sendNotification(title: string, message: string): void {
        browser.notifications.create("wontStopNotification", {
            "type": "basic",
            "iconUrl": browser.extension.getURL("icons/icon-96.png"),
            "title": title,
            "message": message
        });
    }
}