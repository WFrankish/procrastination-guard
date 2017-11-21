declare var chrome: any;

// whether the program is running it's block or allow lists
var running : boolean = false;

// stored data
var inBlockOnlyMode : boolean;
var always : string[];
var block: string[];
var allow: string[];

// which rules are temporarily disabled;
var alwaysTemp: boolean[] = [];
var blockTemp: boolean[] = [];
var allowTemp: boolean[] = [];

// list of rules to use;
var alwaysList: any[];
var blockList: any[];
var allowList: any[];

// initialisation
init();

function init() : void {
    load(null, null, true);
    chrome.storage.onChanged.addListener(load);
    chrome.webRequest.onBeforeRequest.addListener(shouldBlock,
        {
            urls: ["<all_urls>"],
            types: ["main_frame"]
        }, ["blocking"]);
    chrome.browserAction.onClicked.addListener(startBlocking);
}

// load storage (also used as event for storage, so ignore first two arguments)
function load(event: any, scope: any, isInitial: boolean): void {
    // get from web-extension storage
    chrome.storage.local.get("always", (res: any) => {
        if (res != null && Array.isArray(res.always)) {
            always = res.always;
        } else {
            // is no or corrupt stored data
            always = [];
        }
        // create list of rules in use
        alwaysList = [];
        for (var i in always) {
            if (isInitial) {
                // if first time loading this session, set to not disabled
                alwaysTemp[i] = false;
            }
            if (!alwaysTemp[i]) {
                alwaysList.push(always[i])
            }
        }
    });
    chrome.storage.local.get("block", (res: any) => {
        if (res != null && Array.isArray(res.block)) {
            block = res.block;
        } else {
            block = [];
        }
        blockList = [];
        for (var i in block) {
            if (isInitial) {
                blockTemp[i] = false;
            }
            if (!blockTemp[i]) {
                blockList.push(block[i])
            }
        }
    });
    chrome.storage.local.get("allow", (res: any) => {
        if (res != null && Array.isArray(res.allow)) {
            allow = res.allow;
        } else {
            allow = [];
        }
        allowList = [];
        for (var i in allow) {
            if (isInitial) {
                allowTemp[i] = false;
            }
            if (!allowTemp[i]) {
                allowList.push(allow[i])
            }
        }
    });
    chrome.storage.local.get("inBlockOnlyMode", (res: any) => {
        if (res != null && typeof (res.inBlockOnlyMode) == "boolean") {
            inBlockOnlyMode = res.inBlockOnlyMode;
        } else {
            inBlockOnlyMode = true;
        }
    });
}

// remake lists of enabled rules
function repopulate(): void {
    alwaysList = [];
    for (var i in always) {
        if (!alwaysTemp[i]) {
            alwaysList.push(always[i])
        }
    }
    blockList = [];
    for (var i in block) {
        if (!blockTemp[i]) {
            blockList.push(block[i])
        }
    }
    allowList = [];
    for (var i in allow) {
        if (!allowTemp[i]) {
            allowList.push(allow[i])
        }
    }
}

function matchAny(matchList: any[], url: string) {
    for (var i in matchList) {
        if (url.match(matchList[i])) {
            return `${url} was blocked by rule ${matchList[i]}`;
        }
    }
    return null;
}

// given detail from a request sent event, determine whether the url should be 
// blocked or not, creating a notification if it should
function shouldBlock(detail: any) {
    var message;
    if (running) {
        if (!inBlockOnlyMode) {
            message = matchAny(allowList, detail.url);
            if (message == null) {
                chrome.notifications.create("blockNotification", {
                    "type": "basic",
                    "iconUrl": chrome.extension.getURL("icons/icon-96.png"),
                    "title": "Procrastination Guard blocked a website!",
                    "message": `${detail.url} does not match any rules on the allow list`,
                });
            }
            return { cancel: message == null };
        } else {
            message = matchAny(alwaysList, detail.url)
            if (message == null) {
                message = matchAny(blockList, detail.url);
            }
        }
    } else {
        message = matchAny(alwaysList, detail.url);
    }
    if (message != null) {
        chrome.notifications.create("blockNotification", {
            "type": "basic",
            "iconUrl": chrome.extension.getURL("icons/icon-96.png"),
            "title": "Procrastination Guard blocked a website!",
            "message": message
        });
    }
    return { cancel: message != null };
}

// enter work mode
function startBlocking(): void {
    chrome.browserAction.onClicked.removeListener(startBlocking);
    chrome.browserAction.onClicked.addListener(wontStopNotification);
    chrome.browserAction.setTitle({
        title: "Procrastination Guard - Work mode enabled"
    });
    chrome.browserAction.setIcon({
        path: {
            "16": "button/icon-16.png",
            "32": "button/icon-32.png",
            "64": "button/icon-64.png",
            "256": "button/icon-256.png"
        }
    })
    running = true;
    var views = chrome.extension.getViews();
    for (var i in views) {
        if (views[i].location.toString().endsWith("options.html")) {
            views[i].updateStartStop(running);
        }
    }
}

// leave work mode
function stopBlocking(): void {
    chrome.browserAction.onClicked.removeListener(wontStopNotification);
    chrome.browserAction.onClicked.addListener(startBlocking);
    chrome.browserAction.setTitle({
        title: "Procrastination Guard - Enable work mode"
    });
    chrome.browserAction.setIcon({
        path: {
            "16": "button/icon_d-16.png",
            "32": "button/icon_d-32.png",
            "64": "button/icon_d-64.png",
            "256": "button/icon_d-256.png"
        }
    })
    running = false;
    var views = chrome.extension.getViews();
    for (var i in views) {
        if (views[i].location.toString().endsWith("options.html")) {
            views[i].updateStartStop(running);
        }
    }
}

// notify the user when they attempt to enter work mode via the browser action
function wontStopNotification(): void {
    chrome.notifications.create("wontStopNotification", {
        "type": "basic",
        "iconUrl": chrome.extension.getURL("icons/icon-96.png"),
        "title": "Are you sure you're done working?",
        "message": "If so, go to the options page to turn off work mode."
    });
}