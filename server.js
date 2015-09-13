"use strict";

var Docker = require('dockerode-promise');
var dns = require('native-dns');

var docker = new Docker({socketPath: '/var/run/docker.sock'});
var ServiceRepo = require('./src/ServiceRepo');
var DnsServer = require('./src/DnsServer');
var getServiceInfo = require('./src/getServiceInfo');

var serviceRepo = new ServiceRepo();

function handleServicePublished(id){
  return docker.getContainer(id)
  .inspect()
  .then(getServiceInfo)
  .then(info => serviceRepo.addService(info));
}

function handleServiceUnpublished(id){
  return docker.getContainer(id)
  .inspect()
  .then(getServiceInfo)
  .then(info => serviceRepo.removeService(info));
}

docker.listContainers()
.then(containers => containers.map(containerInfo => containerInfo.Id))
.then(ids => Promise.all(ids.map(handleServicePublished)));

docker.getEvents()
.then(events => events.on('data', function(c){
  var event = JSON.parse(c.toString()); 
  console.log(event);
  if(event.status == 'start'){
    handleServicePublished(event.id);
  }else if(event.status == 'stop'){
    handleServiceUnpublished(event.id);
  }
}));

var dnsServer = new DnsServer(serviceRepo);

var tcpServer = dns.createTCPServer();
var server = dns.createServer();

server.on('request', dnsServer.onMessage.bind(dnsServer));
server.on('error', dnsServer.onError);
server.on('listening', dnsServer.onListening);
server.on('socketError', dnsServer.onSocketError);
server.on('close', dnsServer.onClose);

server.serve(53);

tcpServer.on('request', dnsServer.onMessage.bind(dnsServer));
tcpServer.on('error', dnsServer.onError);
tcpServer.on('listening', dnsServer.onListening);
tcpServer.on('socketError', dnsServer.onSocketError);
tcpServer.on('close', dnsServer.onClose);

tcpServer.serve(53);

process.on('SIGTERM', function(){
  process.exit(1);
})