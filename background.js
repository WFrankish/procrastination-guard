"use strict"
Cu.import("resource://gre/modules/MatchPattern.jsm");

// whether the program is running it's block or allow lists
var running = false;

// stored data
var inBlockOnlyMode;
var always;
var block;
var allow;

// which rules are temporarily disabled;
var alwaysTemp = [];
var blockTemp = [];
var allowTemp = [];

// list of rules to use;
var alwaysList;
var blockList;
var allowList;


// initialisation
init();

function init(){
  load(null, null, true);
  chrome.storage.onChanged.addListener(load);
  chrome.webRequest.onBeforeRequest.addListener(shouldBlock, { urls : ["<all_urls>"] }, ["blocking"]);
}

// load storage (also used as event for storage, so ignore first two arguments)
function load(event, scope, isInitial){
  // get from web-extension storage
  chrome.storage.local.get("always", (res) => {
      if(res != null && Array.isArray(res.always)){
        always = res.always;
      } else {
        // is no or corrupt stored data
        always = [];
      }
      // create list of rules in use
      alwaysList = [];
      for(var i in always){
        if(isInitial){
          // if first time loading this session, set to not disabled
          alwaysTemp[i] = false;
        }
        if(!alwaysTemp[i]){
          alwaysList.push(always[i])
        }
      }
    });
    chrome.storage.local.get("block", (res) => {
      if(res != null && Array.isArray(res.block)){
        block = res.block;
      } else {
        block = [];
      }
      blockList = [];
      for(var i in block){
        if(isInital){
          blockTemp[i] = false;
        }
        if(!blockTemp[i]){
          blockList.push(block[i])
        }
      }
    });
    chrome.storage.local.get("allow", (res) => {
      if(res != null && Array.isArray(res.allow)){
        allow = res.allow;
      } else {
        allow = [];
      }
      allowList = [];
      for(var i in allow){
        if(isInitial){
          allowTemp[i] = false;
        }
        if(!allowTemp[i]){
          allowList.push(allow[i])
        }
      }
    });
    chrome.storage.local.get("inBlockOnlyMode", (res) => {
      if(res != null && typeof(res.inBlockOnlyMode) == "boolean"){
        inBlockOnlyMode = res.inBlockOnlyMode;
      } else {
        inBlockOnlyMode = true;
      }
    });    
}

// remake lists of enabled rules
function repopulate(){
  alwaysList = [];
  for(var i in always){
    if(!alwaysTemp[i]){
      alwaysList.push(always[i])
    }
  }
  blockList = [];
  for(var i in block){
    if(!blockTemp[i]){
      blockList.push(block[i])
    }
  }
  allowList = [];
  for(var i in allow){
    if(!allowTemp[i]){
      allowList.push(allow[i])
    }
  }
}
function matchAny(matchList, url){
  for(var i in matchList){
    if(url.match(matchList[i])){
      return true;
    }
  }
  return false;
}

function shouldBlock(detail){
  var result;
  if(running){
    if(inBlockOnlyMode){
      result = matchAny(alwaysList, detail.url) || matchAny(blockList, detail.url);
    } else {
      result = !matchAny(allowList, detail.url);
    }
  } else {
    result = matchAny(alwaysList, detail.url);
  }
  return {cancel: result};
}