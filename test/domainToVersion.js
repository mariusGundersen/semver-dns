"use strict";
const should = global.should;

const domainToVersion = require('../src/domainToVersion');

describe("domainToVersion", function(){
	it("should map versions with exact prefix to the exact version", function(){
		domainToVersion('exact--0.1.2').should.equal('0.1.2')
	});
	
	it("should map versions with patch prefix to ~", function(){
		domainToVersion('patch--0.1.2').should.equal('~0.1.2')
	});
	
	it("should map versions with no prefix to ^", function(){
		domainToVersion('0.1.2').should.equal('^0.1.2')
	});
	
	it("should map versions that don't match anything known to null", function(){
		should.not.exist(domainToVersion('something--0.1.2'));
	});
})