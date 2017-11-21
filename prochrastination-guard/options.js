"use strict"

// stored variables
var inBlockOnlyMode;
var always;
var block;
var allow;

// which rules are temporarily disabled
var alwaysTemp;
var blockTemp;
var allowTemp;

// initialisation
$(document).ready(restoreOptions);

// save variables to storage
function saveOptions(){
  chrome.storage.local.set({
    inBlockOnlyMode : inBlockOnlyMode,
    always : always,
    block : block,
    allow : allow,
  });
  restoreOptions();
}

// load variables from storage
function restoreOptions(){
  $("#addAlwaysButton").unbind("click");
  $("#addAlwaysButton").click(addToAlways);
  $("#addConditionalButton").unbind("click");
  $("#addConditionalButton").click(addToConditional);
  chrome.storage.local.get("always", (res) => {
    if(res != null && Array.isArray(res.always)){
      always = res.always;
    } else {
      always = [];
    }
  });
  chrome.storage.local.get("block", (res) => {
    if(res != null && Array.isArray(res.block)){
      block = res.block;
    } else {
      block = [];
    }
  });
  chrome.storage.local.get("allow", (res) => {
    if(res != null && Array.isArray(res.allow)){
      allow = res.allow;
    } else {
      console.log(res);
      allow = [];
    }
  });
  chrome.storage.local.get("inBlockOnlyMode", (res) => {
    switchMode(res == null || res.inBlockOnlyMode);
  });
  chrome.runtime.getBackgroundPage((page) => {
    alwaysTemp = page.alwaysTemp;
    blockTemp = page.blockTemp;
    allowTemp = page.allowTemp;
    populateAlways();
    populateConditional(inBlockOnlyMode);
    if(!page.running){
      $("#startStopButton").val("Start Work Mode");
    } else {
      $("#startStopButton").val("Stop Work Mode");
    }
    $("#startStopButton").unbind("click");
    $("#startStopButton").click(startStop);
  });
}

// switch between using a block list and an allow list
function switchMode(toBlockMode){
  inBlockOnlyMode = toBlockMode;
  if(toBlockMode){
    $("#blockModeRadio").click();
    $("#blockModeRadio").change(undefined);
    $("#allowModeRadio").change(switchToAllow);
    $("#modeDetail").text( 
      "These sites will be blocked during work mode.");
  } else {
    $("#allowModeRadio").click();
    $("#allowModeRadio").change(undefined);
    $("#blockModeRadio").change(switchToBlock);
    $("#modeDetail").text( 
      "Only these sites will be allowed during work mode.");
  }
}

// switch to a block list and save
function switchToBlock(){
  switchMode(true);
  saveOptions();
}

// switch to an allow list and save
function switchToAllow(){
  switchMode(false);
  saveOptions();
}

// start or stop running
function startStop(){
  chrome.runtime.getBackgroundPage((page) => {
    if(!page.running){
      page.startBlocking();
      $("#startStopButton").val("Stop Work Mode");
    } else {
      page.stopBlocking();
      $("#startStopButton").val("Start Work Mode");
    }
  });
}

// when started via the browser action, update the options page
function updateStartStop(toStart){
  if(toStart){
    $("#startStopButton").val("Stop Work Mode");
  } else {
    $("#startStopButton").val("Start Work Mode");
  }
}

// create the new html for an item on the list
function newHTML(ch, rule, i, inactive){
  var result = [];
  result[0] = $("<div>").addClass("col-l").addClass("pad").text(rule);
  result[1] = $("<div>").addClass("col-r").addClass("pad");
  result[1].html($("<input>").attr("type", "button")
    .attr("id", `delete${ch}${i}`).val("Delete"));
  var button = $("<input type='button'>").attr("type", "button")
    .attr("id", `switch${ch}${i}`)
  if(inactive){
    button.val("Reenable");
  } else {
    button.val("Disable for session")
  }
  result[1].append(button);
  return result;
}

// populate the always list on screen
function populateAlways(){
  var newButtons = [];
  for(var i in always){
    newButtons = newButtons.concat(newHTML('A', always[i], i, alwaysTemp[i]));
  }
  $("#always").html(newButtons);
  for(var i in always){
    makeAlwaysButtons(i)
  }
}


// add functions to the buttons of the always list
function makeAlwaysButtons(i){
  $(`#switchA${ i }`).click(function(){
    chrome.runtime.getBackgroundPage((page) => {
      page.alwaysTemp[i] = !page.alwaysTemp[i];
      page.repopulate();
      saveOptions();
    });
  });
  $(`#deleteA${ i }`).click(function(){
    always.splice(i, 1);
    chrome.runtime.getBackgroundPage((page) => {
      page.alwaysTemp.splice(i, 1);
      saveOptions();
    });
  });
}

// add a new rule to the always list
function addToAlways(){
  var newRule = $("#newAlwaysText").val();
  if(newRule.length > 0){
    always.push(newRule);
    chrome.runtime.getBackgroundPage((page) => {
      page.alwaysTemp.push(false);
    });
    saveOptions();
  }
  $("#newAlwaysText").val("");
}

// populate the allow or block list on screen
function populateConditional(showBlockList){
  var newButtons = [];
  if(inBlockOnlyMode){
    for(var i in block){
      newButtons = newButtons.concat(newHTML('B', block[i], i, blockTemp[i]));
    }
  } else {
    for(var i in allow){
      newButtons = newButtons.concat(newHTML('C', allow[i], i, allowTemp[i]));
    }
  }
  $("#conditional").html(newButtons);
  if(inBlockOnlyMode){
    for(var i in block){
      makeBlockButtons(i)
    }
  } else {
    for(var i in allow){
      makeAllowButtons(i)
    }
  }
}

// add functions to the buttons on the block list
function makeBlockButtons(i){
  $(`#switchB${ i }`).click(function(){
    chrome.runtime.getBackgroundPage((page) => {
      page.blockTemp[i] = !page.blockTemp[i];
      page.repopulate();
      saveOptions();
    });
  });
  $(`#deleteB${ i }`).click(function(){
    block.splice(i, 1);
    chrome.runtime.getBackgroundPage((page) => {
      page.blockTemp.splice(i, 1);
      saveOptions();
    });
  });
}

// add functions to the buttons on the allow list
function makeAllowButtons(i){
  $(`#switchC${ i }`).click(function(){
    chrome.runtime.getBackgroundPage((page) => {
      page.allowTemp[i] = !page.allowTemp[i];
      page.repopulate();
      saveOptions();
    });
  });
  $(`#deleteC${ i }`).click(function(){
    allow.splice(i, 1);
    chrome.runtime.getBackgroundPage((page) => {
      page.allowTemp.splice(i, 1);
      saveOptions();
    });
  });
}

// add a new rule to either the allow list or block list
function addToConditional(){
  var newRule = $("#newConditionalText").val();
  if(newRule.length > 0){
    if(inBlockOnlyMode){
      block.push(newRule);
      chrome.runtime.getBackgroundPage((page) => {
        page.blockTemp.push(false);
      });
    } else {
      allow.push(newRule);
      chrome.runtime.getBackgroundPage((page) => {
        page.allowTemp.push(false);
      });
    }
    saveOptions();
  }
  $("#newConditionalText").val("");
}