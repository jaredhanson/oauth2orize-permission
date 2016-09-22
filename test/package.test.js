/* global describe, it */

var pkg = require('..');
var expect = require('chai').expect;


describe('oauth2orize-permission', function() {
  
  it('should export exchanges', function() {
    expect(pkg.grant).to.be.an('object');
    expect(pkg.grant.permission).to.be.a('function');
  });
  
});
