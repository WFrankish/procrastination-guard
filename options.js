var inBlockOnlyMode = true;
var always = [];
var block = [];
var allow = [];

var blockModeSwitch;
var allowModeSwitch;
var alwaysDiv;
var conditionalDiv;
var modeDetailDiv;
var saveButton;

function saveOptions(e){
  console.log(inBlockOnlyMode);
  chrome.storage.local.set({
    inBlockOnlyMode : inBlockOnlyMode,
    always : always,
    block : block,
    allow : allow,
  });
  restoreOptions();
}

function restoreOptions(){
  blockModeSwitch = document.getElementById("blockMode");
  allowModeSwitch = document.getElementById("allowMode");
  alwaysDiv = document.getElementById("always");
  conditionalDiv = document.getElementById("conditional");
  modeDetailDiv = document.getElementById("modeDetail");
  saveButton = document.getElementById("saveButton");
  saveButton.onclick = saveOptions;
  chrome.storage.local.get("inBlockOnlyMode", (res) => {
    switchMode(res == null || res.inBlockOnlyMode);
  });
  chrome.storage.local.get("always", (res) => {
    if(res != null){
      always = res.always;
    }
  });
  chrome.storage.local.get("block", (res) => {
    if(res != null){
      block = res.block;
    }
  });
  chrome.storage.local.get("allow", (res) => {
    if(res != null){
      allow = res.allow;
    }
  });
}

function switchToBlock(){
  switchMode(true);
}

function switchToAllow(){
  switchMode(false);
}

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

document.addEventListener('DOMContentLoaded', restoreOptions);