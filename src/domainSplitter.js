"use strict";

const domainToVersion = require('./domainToVersion');

module.exports = function(domain){
  var parts = domain.split('.');
  var network = parts.pop();
  var name = parts.pop();
  var version = domainToVersion(parts.join('.'));
  return {
    network,
    name,
    version
  };
}