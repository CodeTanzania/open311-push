'use strict';

//dependencies
const path = require('path');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const faker = require('faker');
const push = require(path.join(__dirname, '..', '..'))();
const Message = mongoose.model('Message');

describe('push', function () {

  it('should be an object', function () {
    expect(push).to.not.be.null;
    expect(push).to.be.an('object');
  });

  it('should have queue name', function () {
    expect(push.queueName).to.exist;
    expect(push.queueName).to.be.equal('push');
  });

  it('should be able to queue message', function () {
    const details = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      body: faker.lorem.sentence()
    };
    const message = new Message(details);

    push.queue(message);

    expect(message.transport).to.exist;
    expect(message.transport).to.be.equal(push.transport);
    expect(message.queueName).to.exist;
    expect(message.queueName).to.be.equal(push.queueName);

  });

});