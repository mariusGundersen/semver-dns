"use strict";

const domainSplitter = require('./domainSplitter');
const dns = require('native-dns');

module.exports = class DnsServer{

  constructor(serviceRepo){
    this.serviceRepo = serviceRepo;
  }

  onMessage(request, response) {
    const requestName = request.question[0].name;
    const requester = request.address;
    console.log('request from:', requester);
    console.log('question', requestName);

    var parts = domainSplitter(requestName);
    console.log('looking for', parts);

    var records = this.serviceRepo.findServices(parts.network, parts.name, parts.version);
    console.log('found', records);

    response.answer = records.map(record => dns.A({
      name: requestName,
      address: record.ip,
      ttl: 10, //things happen quickly!
    }));
    response.send();
  }

  onError(err, buff, req, res) {
    console.log(err.stack);
  }

  onListening() {
    console.log('server listening on', this.address());
  }

  onSocketError(err, socket) {
    console.log(err);
  }

  onClose() {
    console.log('server closed', this.address());
  }
}