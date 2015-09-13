"use strict";

var ServiceRepo = require('../src/ServiceRepo');

describe("ServiceRepo", function(){
	beforeEach(function(){
		this.serviceRepo = new ServiceRepo();
	});
	
	it("should be a ServiceRepo", function(){
		this.serviceRepo.should.be.an.instanceOf(ServiceRepo);
	});
});