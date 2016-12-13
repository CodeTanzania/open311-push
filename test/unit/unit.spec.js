'use strict';

//dependencies
const path = require('path');
const expect = require('chai').expect;
const push = require(path.join(__dirname, '..', '..'))();

describe('push', function () {

  it('should be an object', function () {
    expect(push).to.not.be.null;
    expect(push).to.be.an('object');
  });

  it('should have queue name', function () {
    expect(push.queueName).to.exist;
    expect(push.queueName).to.be.equal('push');
  });

});