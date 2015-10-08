"use strict";

const getServiceInfo = require('../src/getServiceInfo');

describe("getServiceInfo", function(){
  it("should use the right fields", function(){
    const info = getServiceInfo({
      Id: "123456",
      Config: {
        Labels: {
          SemVerDNS: '1.2.3.name.network'
        }
      },
      NetworkSettings: {
        IPAddress: '10.20.33.14'
      }
    });

    info.id.should.equal("123456");
    info.network.should.equal("network");
    info.name.should.equal("name");
    info.version.should.equal("1.2.3");
    info.ip.should.equal("10.20.33.14")
  });

  it("should return dummy data if label is missing", function(){
    const info = getServiceInfo({
      Id: "123456",
      Config: {
        Labels: {}
      },
      NetworkSettings: {
        IPAddress: '10.20.33.14'
      }
    });

    info.id.should.equal("123456");
    info.network.should.equal("");
    info.name.should.equal("");
    info.version.should.equal("");
    info.ip.should.equal("10.20.33.14")
  });
});