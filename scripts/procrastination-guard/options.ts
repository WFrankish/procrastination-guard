$(initOptions);

function initOptions() {
    browser.runtime.getBackgroundPage().then((page: any) => {
        var background = page.background;
        var options = new Options(background);
    });
}

class Options implements IOptions {

    private readonly background: IBackground;
    private readonly storage:  IStorage;

    constructor(background: IBackground) {
        this.background = background;
        this.storage = background.storage;
    }

    restoreOptions(): void {
        $("#addAlwaysButton").unbind("click");
        $("#addAlwaysButton").click(this.addToAlways);
        $("#addConditionalButton").unbind("click");
        $("#addConditionalButton").click(this.addToConditional);
        this.populateAlways();
        this.populateConditional(this.background.storage.inBlockOnlyMode);
        if (!this.background.isRunning) {
            $("#startStopButton").val("Start Work Mode");
        } else {
            $("#startStopButton").val("Stop Work Mode");
        }
        $("#startStopButton").unbind("click");
        $("#startStopButton").click(this.startStop);
    }

    // switch between using a block list and an allow list
    switchMode(toBlockMode: boolean): void {
        this.background.storage.inBlockOnlyMode = toBlockMode;
        if (toBlockMode) {
            $("#blockModeRadio").click();
            $("#blockModeRadio").change(undefined);
            $("#allowModeRadio").change(this.switchToAllow);
            $("#modeDetail").text(
                "These sites will be blocked during work mode.");
        } else {
            $("#allowModeRadio").click();
            $("#allowModeRadio").change(undefined);
            $("#blockModeRadio").change(this.switchToBlock);
            $("#modeDetail").text(
                "Only these sites will be allowed during work mode.");
        }
    }

    // switch to a block list and save
    switchToBlock(): void {
        this.switchMode(true);
        this.storage.save();
    }

    // switch to an allow list and save
    switchToAllow(): void {
        this.switchMode(false);
        this.storage.save();
    }

    // start or stop running
    startStop() {
        browser.runtime.getBackgroundPage((page: any) => {
            if (!page.running) {
                page.startBlocking();
                $("#startStopButton").val("Stop Work Mode");
            } else {
                page.stopBlocking();
                $("#startStopButton").val("Start Work Mode");
            }
        });
    }

    // when started via the browser action, update the options page
    updateStartStop(toStart: boolean): any {
        if (toStart) {
            $("#startStopButton").val("Stop Work Mode");
        } else {
            $("#startStopButton").val("Start Work Mode");
        }
    }

    // create the new html for an item on the list
    newHTML(ch: "A" | "B" | "C", rule: string, i: string, inactive: boolean): string {
        var result = [];
        result[0] = $("<div>").addClass("col-l").addClass("pad").text(rule);
        result[1] = $("<div>").addClass("col-r").addClass("pad");
        result[1].html($("<input>").attr("type", "button")
            .attr("id", `delete${ch}${i}`).val("Delete"));
        var button = $("<input type='button'>").attr("type", "button")
            .attr("id", `switch${ch}${i}`)
        if (inactive) {
            button.val("Reenable");
        } else {
            button.val("Disable for session")
        }
        result[1].append(button);
        return result;
    }

    // populate the always list on screen
    populateAlways(): void {
        var newButtons: string[] = [];
        for (var i in always) {
            newButtons = newButtons.concat(newHTML('A', always[i], i, alwaysTemp[i]));
        }
        $("#always").html(newButtons);
        for (var i in always) {
            makeAlwaysButtons(i)
        }
    }


    // add functions to the buttons of the always list
    makeAlwaysButtons(i: number): void {
        $(`#switchA${i}`).click(function () {
            browser.runtime.getBackgroundPage((page: any) => {
                page.alwaysTemp[i] = !page.alwaysTemp[i];
                page.repopulate();
                saveOptions();
            });
        });
        $(`#deleteA${i}`).click(function () {
            always.splice(i, 1);
            browser.runtime.getBackgroundPage((page: any) => {
                page.alwaysTemp.splice(i, 1);
                saveOptions();
            });
        });
    }

    // add a new rule to the always list
    addToAlways(): void {
        var newRule: string = $("#newAlwaysText").val() as string;
        if (newRule.length > 0) {
            always.push(newRule);
            browser.runtime.getBackgroundPage((page: any) => {
                page.alwaysTemp.push(false);
            });
            saveOptions();
        }
        $("#newAlwaysText").val("");
    }

    // populate the allow or block list on screen
    populateConditional(showBlockList: boolean): void {
        var newButtons: string[] = [];
        if (inBlockOnlyMode) {
            for (var i in block) {
                newButtons = newButtons.concat(newHTML('B', block[i], i, blockTemp[i]));
            }
        } else {
            for (var i in allow) {
                newButtons = newButtons.concat(newHTML('C', allow[i], i, allowTemp[i]));
            }
        }
        $("#conditional").html(newButtons);
        if (inBlockOnlyMode) {
            for (var i in block) {
                makeBlockButtons(i)
            }
        } else {
            for (var i in allow) {
                makeAllowButtons(i)
            }
        }
    }

    // add functions to the buttons on the block list
    makeBlockButtons(i: string) {
        $(`#switchB${i}`).click(function () {
            browser.runtime.getBackgroundPage((page: any) => {
                page.blockTemp[i] = !page.blockTemp[i];
                page.repopulate();
                saveOptions();
            });
        });
        $(`#deleteB${i}`).click(function () {
            block.splice(i, 1);
            browser.runtime.getBackgroundPage((page: any) => {
                page.blockTemp.splice(i, 1);
                saveOptions();
            });
        });
    }

    // add functions to the buttons on the allow list
    makeAllowButtons(i: string) {
        $(`#switchC${i}`).click(function () {
            browser.runtime.getBackgroundPage((page: any) => {
                page.allowTemp[i] = !page.allowTemp[i];
                page.repopulate();
                saveOptions();
            });
        });
        $(`#deleteC${i}`).click(function () {
            allow.splice(i, 1);
            browser.runtime.getBackgroundPage((page: any) => {
                page.allowTemp.splice(i, 1);
                saveOptions();
            });
        });
    }

    // add a new rule to either the allow list or block list
    addToConditional() {
        var newRule: string = $("#newConditionalText").val() as string;
        if (newRule.length > 0) {
            if (inBlockOnlyMode) {
                block.push(newRule);
                browser.runtime.getBackgroundPage((page: any) => {
                    page.blockTemp.push(false);
                });
            } else {
                allow.push(newRule);
                browser.runtime.getBackgroundPage((page: any) => {
                    page.allowTemp.push(false);
                });
            }
            saveOptions();
        }
        $("#newConditionalText").val("");
    }
}
