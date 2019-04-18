"use strict";
var options = angular.module("options", []);
options.controller("optionsCtrl", $scope => {
    var backgroundPage = browser.extension.getBackgroundPage();
    var background = backgroundPage.background;
    var options = new Options(background);
    $scope.storage = background.storage;
    $scope.options = options;
    $scope.addToAlways = () => options.addToAlways();
    $scope.addToConditional = () => options.addToConditional();
    $scope.startStop = () => options.startStop();
    options.restoreOptions();
});
class Options {
    constructor(background) {
        this.background = background;
        this.storage = background.storage;
    }
    restoreOptions() {
        this.populateAlways();
        this.populateConditional(this.storage.inBlockOnlyMode);
        if (!this.background.isRunning) {
            $("#startStopButton").val("Start Work Mode");
        }
        else {
            $("#startStopButton").val("Stop Work Mode");
        }
    }
    switchMode(toBlockMode) {
        this.background.storage.inBlockOnlyMode = toBlockMode;
        if (toBlockMode) {
            $("#blockModeRadio").click();
            $("#blockModeRadio").change(undefined);
            $("#allowModeRadio").change(this.switchToAllow);
            $("#modeDetail").text("These sites will be blocked during work mode.");
        }
        else {
            $("#allowModeRadio").click();
            $("#allowModeRadio").change(undefined);
            $("#blockModeRadio").change(this.switchToBlock);
            $("#modeDetail").text("Only these sites will be allowed during work mode.");
        }
    }
    switchToBlock() {
        this.switchMode(true);
        this.storage.save();
    }
    switchToAllow() {
        this.switchMode(false);
        this.storage.save();
    }
    startStop() {
        if (!this.background.isRunning) {
            this.background.startWorkMode();
            $("#startStopButton").val("Stop Work Mode");
        }
        else {
            this.background.endWorkMode();
            $("#startStopButton").val("Start Work Mode");
        }
    }
    updateStartStop(toStart) {
        if (toStart) {
            $("#startStopButton").val("Stop Work Mode");
        }
        else {
            $("#startStopButton").val("Start Work Mode");
        }
    }
    newHTML(ch, rule, i, inactive) {
        var result = [];
        result[0] = $("<div>").addClass("col-l").addClass("pad").text(rule);
        result[1] = $("<div>").addClass("col-r").addClass("pad");
        result[1].html($("<input>").attr("type", "button")
            .attr("id", `delete${ch}${i}`).val("Delete"));
        var button = $("<input type='button'>").attr("type", "button")
            .attr("id", `switch${ch}${i}`);
        if (inactive) {
            button.val("Reenable");
        }
        else {
            button.val("Disable for session");
        }
        result[1].append(button);
        return result;
    }
    populateAlways() {
        var newButtons = [];
        for (var i in always) {
            newButtons = newButtons.concat(newHTML('A', always[i], i, alwaysTemp[i]));
        }
        $("#always").html(newButtons);
        for (var i in always) {
            makeAlwaysButtons(i);
        }
    }
    makeAlwaysButtons(i) {
        $(`#switchA${i}`).click(function () {
            browser.runtime.getBackgroundPage((page) => {
                page.alwaysTemp[i] = !page.alwaysTemp[i];
                page.repopulate();
                saveOptions();
            });
        });
        $(`#deleteA${i}`).click(function () {
            always.splice(i, 1);
            browser.runtime.getBackgroundPage((page) => {
                page.alwaysTemp.splice(i, 1);
                saveOptions();
            });
        });
    }
    addToAlways() {
        var newRule = $("#newAlwaysText").val();
        if (newRule.length > 0) {
            always.push(newRule);
            browser.runtime.getBackgroundPage((page) => {
                page.alwaysTemp.push(false);
            });
            saveOptions();
        }
        $("#newAlwaysText").val("");
    }
    populateConditional(showBlockList) {
        var newButtons = [];
        if (inBlockOnlyMode) {
            for (var i in block) {
                newButtons = newButtons.concat(newHTML('B', block[i], i, blockTemp[i]));
            }
        }
        else {
            for (var i in allow) {
                newButtons = newButtons.concat(newHTML('C', allow[i], i, allowTemp[i]));
            }
        }
        $("#conditional").html(newButtons);
        if (inBlockOnlyMode) {
            for (var i in block) {
                makeBlockButtons(i);
            }
        }
        else {
            for (var i in allow) {
                makeAllowButtons(i);
            }
        }
    }
    makeBlockButtons(i) {
        $(`#switchB${i}`).click(function () {
            browser.runtime.getBackgroundPage((page) => {
                page.blockTemp[i] = !page.blockTemp[i];
                page.repopulate();
                saveOptions();
            });
        });
        $(`#deleteB${i}`).click(function () {
            block.splice(i, 1);
            browser.runtime.getBackgroundPage((page) => {
                page.blockTemp.splice(i, 1);
                saveOptions();
            });
        });
    }
    makeAllowButtons(i) {
        $(`#switchC${i}`).click(function () {
            browser.runtime.getBackgroundPage((page) => {
                page.allowTemp[i] = !page.allowTemp[i];
                page.repopulate();
                saveOptions();
            });
        });
        $(`#deleteC${i}`).click(function () {
            allow.splice(i, 1);
            browser.runtime.getBackgroundPage((page) => {
                page.allowTemp.splice(i, 1);
                saveOptions();
            });
        });
    }
    addToConditional() {
        var newRule = $("#newConditionalText").val();
        if (newRule.length > 0) {
            if (inBlockOnlyMode) {
                block.push(newRule);
                browser.runtime.getBackgroundPage((page) => {
                    page.blockTemp.push(false);
                });
            }
            else {
                allow.push(newRule);
                browser.runtime.getBackgroundPage((page) => {
                    page.allowTemp.push(false);
                });
            }
            saveOptions();
        }
        $("#newConditionalText").val("");
    }
}
