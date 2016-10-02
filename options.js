"use strict"

var inBlockOnlyMode = true;
var always = [];
var block = [];
var allow = [];

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

function saveOptions(){
  chrome.storage.local.set({
    inBlockOnlyMode : inBlockOnlyMode,
    always : always,
    block : block,
    allow : allow,
  });
  restoreOptions();
}

function restoreOptions(){
  console.log("reloaded");
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
  chrome.storage.local.get("inBlockOnlyMode", (res) => {
    switchMode(res == null || res.inBlockOnlyMode);
  });
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
  populateAlways();
  populateConditional(inBlockOnlyMode);
}

function switchToBlock(){
  switchMode(true);
  saveOptions();
}

function switchToAllow(){
  switchMode(false);
  saveOptions();
}

function populateAlways(){
  var innerHTML = "";
  for(var i in always){
    innerHTML += newAlwaysHTML(always[i].rule, i);
  }
  alwaysDiv.innerHTML = innerHTML;
  for(var i in always){
    makeAlwaysButtons(i)
  }
}

function newAlwaysHTML(string, i){
  var result = '<div class="col-l pad">' + string + '</div>';
  result += '<div class="col-r pad"><input type="button" id="allowA' + i;
  result += '" value="Allow for session"></input><input type="button" ';
  result += 'id="deleteA' + i + '" value="Delete"></input></div>';
  return result;
}

function makeAlwaysButtons(i){
  var allowButton = document.getElementById("allowA"+i);
  allowButton.onclick = function(){
    always[i].tempAllow = true;
  }
  var deleteButton = document.getElementById("deleteA"+i);
  deleteButton.onclick = function(){
    always.splice(i, 1);
    saveOptions();
  }
}

function addToAlways(){
  if(newAlwaysBox.value.length > 0){
    var newRule = newAlwaysBox.value;
    always.push({
        rule : newRule,
        tempAllow : false,
    });
    saveOptions();
  }
  newAlwaysBox.value = "";
}

function populateConditional(showBlockList){
  var innerHTML = "";
  if(inBlockOnlyMode){
    for(var i in block){
      innerHTML += newBlockHTML(block[i].rule, i);
    }
  } else {
    for(var i in allow){
      innerHTML += newAllowHTML(allow[i].rule, i);
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

function newBlockHTML(string, i){
  var result = '<div class="col-l pad">' + string + '</div>';
  result += '<div class="col-r pad"><input type="button" id="allowB' + i;
  result += '" value="Allow for session"></input><input type="button" ';
  result += 'id="deleteB' + i + '" value="Delete"></input></div>';
  return result;
}

function makeBlockButtons(i){
  var allowButton = document.getElementById("allowB"+i);
  allowButton.onclick = function(){
    block[i].tempAllow = true;
  }
  var deleteButton = document.getElementById("deleteB"+i);
  deleteButton.onclick = function(){
    block.splice(i, 1);
    saveOptions();
  }
}

function newAllowHTML(string, i){
  var result = '<div class="col-l pad">' + string + '</div>';
  result += '<div class="col-r pad"><input type="button" id="ban' + i;
  result += '" value="Ban for session"></input><input type="button" ';
  result += 'id="deleteC' + i + '" value="Delete"></input></div>';
  return result;
}

function makeAllowButtons(i){
  var banButton = document.getElementById("ban"+i);
  banButton.onclick = function(){
    allow[i].tempBan = true;
  }
  var deleteButton = document.getElementById("deleteC"+i);
  deleteButton.onclick = function(){
    allow.splice(i, 1);
    saveOptions();
  }
}

function addToConditional(){
  if(newConditionalBox.value.length > 0){
    if(inBlockOnlyMode){
      var newRule = newConditionalBox.value;
      block.push({
          rule : newRule,
          tempAllow : false,
      });
      saveOptions();
    } else {
      var newRule = newConditionalBox.value;
      allow.push({
          rule : newRule,
          tempBan : false,
      });
      saveOptions();
    }
  }
  newConditionalBox.value = "";
}

document.addEventListener('DOMContentLoaded', restoreOptions);