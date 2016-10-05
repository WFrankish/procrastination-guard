"use strict"

// stored variables
var inBlockOnlyMode;
var always;
var block;
var allow;

// which rules are temporarily disables
var alwaysTemp;
var blockTemp;
var allowTemp;

// DOM objects
var blockModeSwitch;
var allowModeSwitch;
var alwaysDiv;
var newAlwaysBox;
var addAlwaysButton;
var modeDetailDiv;
var conditionalDiv;
var newConditionalBox;
var addConditionalButton;
var saveButton;

// initialisation
document.addEventListener('DOMContentLoaded', restoreOptions);

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
  blockModeSwitch = document.getElementById("blockMode");
  allowModeSwitch = document.getElementById("allowMode");
  alwaysDiv = document.getElementById("always");
  newAlwaysBox = document.getElementById("newAlways");
  addAlwaysButton = document.getElementById("alwaysAdd");
  addAlwaysButton.onclick = addToAlways;
  modeDetailDiv = document.getElementById("modeDetail");
  conditionalDiv = document.getElementById("conditional");
  newConditionalBox = document.getElementById("newConditional");
  addConditionalButton = document.getElementById("conditionalAdd");
  addConditionalButton.onclick = addToConditional;
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
  });
}

// switch between using a block list and an allow list
function switchMode(toBlockMode){
  inBlockOnlyMode = toBlockMode;
  if(toBlockMode){
    blockModeSwitch.click();
    blockModeSwitch.onchange = undefined;
    allowModeSwitch.onchange = switchToAllow;
    modeDetailDiv.innerHTML = 
      "<p>These sites will be blocked during work mode.</p>";
  } else {
    allowModeSwitch.click();
    allowModeSwitch.onchange = undefined;
    blockModeSwitch.onchange = switchToBlock;
    modeDetailDiv.innerHTML = 
      "<p>Only these sites will be allowed during work mode.</p>";
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

// create the new html for an item on the list
function newHTML(ch, rule, i, inactive){
  var result = '<div class="col-l pad">' + rule + '</div>';
  result += '<div class="col-r pad"><input type="button" id="switch' + ch + i;
  if(inactive){
    result += '" value="Reenable"></input><input type="button" ';
  } else {
    result += '" value="Disable for session"></input><input type="button" ';
  }
  result += 'id="delete' + ch + i + '" value="Delete"></input></div>';
  return result;
}

// populate the always list on screen
function populateAlways(){
  var innerHTML = "";
  for(var i in always){
    innerHTML += newHTML('A', always[i], i, alwaysTemp[i]);
  }
  alwaysDiv.innerHTML = innerHTML;
  for(var i in always){
    makeAlwaysButtons(i)
  }
}


// add functions to the buttons of the always list
function makeAlwaysButtons(i){
  var allowButton = document.getElementById("switchA"+i);
  allowButton.onclick = function(){
    chrome.runtime.getBackgroundPage((page) => {
      page.alwaysTemp[i] = !page.alwaysTemp[i];
      page.repopulate();
      saveOptions();
    });
  }
  var deleteButton = document.getElementById("deleteA"+i);
  deleteButton.onclick = function(){
    always.splice(i, 1);
    chrome.runtime.getBackgroundPage((page) => {
      page.alwaysTemp.splice(i, 1);
      saveOptions();
    });
  }
}

// add a new rule to the always list
function addToAlways(){
  if(newAlwaysBox.value.length > 0){
    var newRule = newAlwaysBox.value;
    always.push(newRule);
    chrome.runtime.getBackgroundPage((page) => {
      page.alwaysTemp.push(false);
    });
    saveOptions();
  }
  newAlwaysBox.value = "";
}

// populate the allow or block list on screen
function populateConditional(showBlockList){
  var innerHTML = "";
  if(inBlockOnlyMode){
    for(var i in block){
      innerHTML += newHTML('B', block[i], i, blockTemp[i]);
    }
  } else {
    for(var i in allow){
      innerHTML += newHTML('C', allow[i], i, allowTemp[i]);
    }
  }
  conditionalDiv.innerHTML = innerHTML;
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
  var allowButton = document.getElementById("switchB"+i);
  allowButton.onclick = function(){
    chrome.runtime.getBackgroundPage((page) => {
      page.blockTemp[i] = !page.blockTemp[i];
      page.repopulate();
      saveOptions();
    });
  }
  var deleteButton = document.getElementById("deleteB"+i);
  deleteButton.onclick = function(){
    block.splice(i, 1);
    chrome.runtime.getBackgroundPage((page) => {
      page.blockTemp.splice(i, 1);
      saveOptions();
    });
  }
}

// add functions to the buttons on the allow list
function makeAllowButtons(i){
  var banButton = document.getElementById("switchC"+i);
  banButton.onclick = function(){
    chrome.runtime.getBackgroundPage((page) => {
      page.allowTemp[i] = !page.allowTemp[i];
      page.repopulate();
      saveOptions();
    });
  }
  var deleteButton = document.getElementById("deleteC"+i);
  deleteButton.onclick = function(){
    allow.splice(i, 1);
    chrome.runtime.getBackgroundPage((page) => {
      page.allowTemp.splice(i, 1);
      saveOptions();
    });
  }
}

// add a new rule to either the allow list or block list
function addToConditional(){
  if(newConditionalBox.value.length > 0){
    if(inBlockOnlyMode){
      block.push(newConditionalBox.value);
      chrome.runtime.getBackgroundPage((page) => {
        page.blockTemp.push(false);
      });
    } else {
      allow.push(newConditionalBox.value);
      chrome.runtime.getBackgroundPage((page) => {
        page.allowTemp.push(false);
      });
    }
  }
  saveOptions();
  newConditionalBox.value = "";
}