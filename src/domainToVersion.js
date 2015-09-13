"use strict";
const test = /^((exact--)|(patch--)|(\d+))(.*)$/;

module.exports = function domainToVersion(domain){
  var result = test.exec(domain)
  
  if(result){
    const pre = result[1];
    const version = result[5];
	  
    if(pre == 'exact--'){
      return version;
    }
    
    if(pre == 'patch--'){
      return '~' + version;
    }
    
    if(pre != undefined){
      return '^' + result[4] + version;
    }
  }
  
  return null;
};