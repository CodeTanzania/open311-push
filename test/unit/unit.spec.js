'use strict';

//dependencies
const path = require('path');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const faker = require('faker');
const push = require(path.join(__dirname, '..', '..'));
push.options = {
  apiKey: faker.random.uuid() //fake apiKey
};
const Message = mongoose.model('Message');

describe('push', function () {

  it('should be an object', function (done) {
    expect(push).to.not.be.null;
    expect(push).to.be.an('object');
    done();
  });

  it('should have queue name', function (done) {
    expect(push.queueName).to.exist;
    expect(push.queueName).to.be.equal('push');
    done();
  });

  it('should be able to queue message', function (done) {

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

    done();

  });

  it('should be able to simulate message send', function (done) {
    const details = {
      from: faker.internet.email(),
      to: faker.internet.email(),
      body: faker.lorem.sentence(),
      options: {
        fake: true,
        data: {
          key1: faker.lorem.sentence(),
          key2: faker.random.uuid()
        },
        notification: {
          icon: 'ic_launcher'
        }
      }
    };
    const message = new Message(details);

    push.send(message, function (error, result) {

      expect(error).to.not.exist;
      expect(result).to.exist;

      expect(result.message).to.exist;
      expect(result.message).to.be.equal('success');

      done();

    });

  });

  afterEach(function (done) {
    push.stop(done);
  });

});