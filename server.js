"use strict";

var semver = require('semver');
var Docker = require('dockerode');
var dns = require('native-dns'),
  tcpserver = dns.createTCPServer(),
  server = dns.createServer();

var docker = new Docker({socketPath: '/var/run/docker.sock'});

var services = [];

var onMessage = function (request, response) {
  console.log('request from:', request.address);
  console.log('question', request.question[0].name);
  
  var parts = request.question[0].name.split('.');
  if(parts.pop() === 'semver'){
    var name = parts.pop();
    var minor = /^minor--(\d+)$/.exec(parts[0]);
    if(minor){
      parts[0] = '^'+minor[1];
    }
    var patch = /^patch--(\d+)$/.exec(parts[0]);
    if(patch){
      parts[0] = '~'+patch[1];
    }
    var version = parts.join('.');
    console.log('looking for', name, version);
    
    var versions = services.filter(function(service){
      return service.name == name;
    });
     
    var found = semver.maxSatisfying(versions.map(function(version){return version.version;}), version);
    if(found){
      var record = versions.filter(function(version){return version.version == found})[0];
      console.log("found", found, record);
      response.answer.push(dns.A({
        name: request.question[0].name,
        address: record.ip,
        ttl: 10, //things happen quickly!
      }));
    }
  }
  console.log(response.answer);
  response.send();
};

var onError = function (err, buff, req, res) {
  console.log(err.stack);
};

var onListening = function () {
  console.log('server listening on', this.address());
};

var onSocketError = function (err, socket) {
  console.log(err);
};

var onClose = function () {
  console.log('server closed', this.address());
};

docker.getEvents(function(err, data){
  data.on('data', function(c){
    var event = JSON.parse(c.toString()); 
    console.log(event);
    if(event.status == 'start' || event.status == 'stop'){
      docker.getContainer(event.id).inspect(function(err, result){
        if(result.Config.Labels && 'SemVerDNS' in result.Config.Labels){
          var parts = result.Config.Labels['SemVerDNS'].split('.');
          if(parts.pop() == 'semver'){
            var name = parts.pop();
            var version = parts.join('.');
            if(event.status == 'stop'){
              console.log("stopped", name, version);
              services.splice(services.indexOf(services.filter(function(service){
                return service.name == name && service.version == version;
              })[0]), 1);
            }else if(event.status  == 'start'){
              console.log("started", name, version);
              services.push({
                name: name,
                version: version,
                ip: result.NetworkSettings.IPAddress
              });
            }
          }
        }
      });
    }
  });
});

server.on('request', onMessage);
server.on('error', onError);
server.on('listening', onListening);
server.on('socketError', onSocketError);
server.on('close', onClose);

server.serve(53, '172.17.42.1');

tcpserver.on('request', onMessage);
tcpserver.on('error', onError);
tcpserver.on('listening', onListening);
tcpserver.on('socketError', onSocketError);
tcpserver.on('close', onClose);

tcpserver.serve(53, '172.17.42.1');
