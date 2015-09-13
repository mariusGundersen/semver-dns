"use strict";

var networkSymbol = Symbol('networks');
var semver = require('semver');


module.exports = class ServiceRepo {
  constructor(){
    this[networkSymbol] = new Map();
  }
  
  addService(entry){
    var networks = this[networkSymbol];
    if(!networks.has(entry.network)){
      networks.set(entry.network, new Map());
    }
    var services = networks.get(entry.network);
    if(!services.has(entry.name)){
      services.set(entry.name, new Map());
    }
    var versions = services.get(entry.name);
    if(!versions.has(entry.version)){
      versions.set(entry.version, []);
    }
    var apps = versions.get(entry.version);
    if(apps.filter(app => app.id === entry.id).length) return;
    apps.push(entry);
  }
  
  removeService(entry){
    var networks = this[networkSymbol];
    if(!networks.has(entry.network)){
      return;
    }
    var services = networks.get(entry.network);
    if(!services.has(entry.name)){
      return;
    }
    var versions = services.get(entry.name);
    if(!versions.has(entry.version)){
      return
    }
    var apps = versions.get(entry.version);
    versions.set(entry.version, apps.filter(app => app.id !== entry.id));
  }
  
  findServices(network, name, version){
    var networks = this[networkSymbol];
    var services = networks.get(network);
    if(!services) return [];
    
    var versions = services.get(name);
    if(!versions) return [];
    
    var found = semver.maxSatisfying(Array.from(versions.keys()), version);
    if(!found) return [];
    return versions.get(found);
  }
};